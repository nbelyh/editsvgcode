import { useState, useCallback, useRef, useEffect } from 'react';
import { Group, ActionIcon, Button, Text, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconFilePlus, IconFolderOpen, IconDownload, IconCloudUpload, IconSparkles, IconInfoCircle, IconLock, IconWorld } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Allotment } from 'allotment';
import { DiffEditor, type DiffOnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Editor, type EditorHandle } from '../components/Editor';
import { Preview } from '../components/Preview';
import { Sidebar } from '../components/Sidebar';
import { TeachingBubble } from '../components/TeachingBubble';
import { AiChat } from '../components/aichat';
import { EditSvgCodeDb, friendlyError } from '../lib/firebase';
import { getNewUniqueId, stripBom, findElementRange, formatXml } from '../lib/svg-utils';
import { saveSvgCode, loadSvgCode, pushCheckpoint, popCheckpoints, hasCheckpoints } from '../lib/chat-storage';
import { getAuth } from 'firebase/auth';
import DEFAULT_SVG from '../assets/default.svg?raw';

export function EditorPage() {
  const { fileId: routeFileId } = useParams<{ fileId?: string }>();
  const navigate = useNavigate();

  const [svgCode, setSvgCode] = useState('Loading please wait...');
  const [readOnly, setReadOnly] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const [fileId, setFileId] = useState(() => routeFileId || localStorage.getItem('esvg-local-id') || (() => {
    const id = '_local_' + getNewUniqueId();
    localStorage.setItem('esvg-local-id', id);
    return id;
  })());
  const dbRef = useRef<EditSvgCodeDb | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<EditorHandle>(null);
  const [sidebarTab, setSidebarTab] = useState<string>(() =>
    localStorage.getItem('esvg-sidebar-tab') || sessionStorage.getItem('esvg-sidebar-tab') || 'info'
  );
  const [selectedElement, setSelectedElement] = useState<string | undefined>();
  const [selectedLineRange, setSelectedLineRange] = useState<{ start: number; end: number } | undefined>();
  const [selectedXPath, setSelectedXPath] = useState<string | undefined>();
  const [canUndo, setCanUndo] = useState(false);
  const [proposedSvg, setProposedSvg] = useState<string | null>(null);
  const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);

  /** Detach models from the DiffEditor widget, then clear the proposal. */
  const clearProposal = useCallback(() => {
    diffEditorRef.current?.setModel(null);
    diffEditorRef.current = null;
    setProposedSvg(null);
  }, []);

  const handleDiffMount: DiffOnMount = (ed) => {
    diffEditorRef.current = ed;
  };

  // Persist SVG to IndexedDB so it matches chat history on reload
  useEffect(() => {
    if (!readOnly) saveSvgCode(svgCode, fileId);
  }, [svgCode, readOnly, fileId]);

  // Global F1 handler so it works even when focus is outside the editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        editorRef.current?.openCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const db = new EditSvgCodeDb();
    dbRef.current = db;

    const handleDbInit = async () => {
      const uniqueId = routeFileId || '';
      if (uniqueId) setFileId(uniqueId);
      const currentFileId = uniqueId || localStorage.getItem('esvg-local-id') || fileId;

      if (uniqueId) {
        // URL-based file: always verify Firestore access first
        try {
          const result = await db.loadDocument(uniqueId);
          if (result) {
            setIsPrivate(result.private);
            // Prefer local edits (chat history) if available
            const savedSvg = await loadSvgCode(currentFileId);
            setCanUndo(await hasCheckpoints(currentFileId));
            if (savedSvg && savedSvg.includes('<svg')) {
              setSvgCode(formatXml(savedSvg));
            } else {
              setSvgCode(formatXml(result.text || DEFAULT_SVG));
            }
          } else {
            setSvgCode(DEFAULT_SVG);
          }
        } catch (err) {
          // Access denied — do not load content
          setSvgCode(DEFAULT_SVG);
          notifications.show({ title: 'Access denied', message: 'This file is private or does not exist.', color: 'red' });
        }
        setReadOnly(false);
      } else {
        // Local file: use IndexedDB directly
        const savedSvg = await loadSvgCode(currentFileId);
        setCanUndo(await hasCheckpoints(currentFileId));
        if (savedSvg && savedSvg.includes('<svg')) {
          setSvgCode(formatXml(savedSvg));
        } else {
          setSvgCode(DEFAULT_SVG);
        }
        setReadOnly(false);
      }
    };

    // If user is already authenticated, load immediately; otherwise wait for dbinit
    if (getAuth().currentUser) {
      handleDbInit();
    }
    document.addEventListener('dbinit', handleDbInit);
    return () => document.removeEventListener('dbinit', handleDbInit);
  }, [routeFileId]);

  const handleSave = useCallback(() => {
    const db = dbRef.current;
    if (!db) return;
    const uniqueId = routeFileId || getNewUniqueId();
    setSaving(true);
    setFileId(uniqueId);
    db.saveDocument(uniqueId, svgCode, isPrivate)
      .then(() => {
        navigate('/' + uniqueId, { replace: true });
        notifications.show({ title: 'Saved', message: 'File saved successfully.', color: 'green' });
      })
      .catch((err) => {
        notifications.show({ title: 'Save failed', message: friendlyError(err), color: 'red' });
      })
      .finally(() => setSaving(false));
  }, [svgCode, routeFileId, navigate, isPrivate]);

  const handleTogglePrivate = useCallback(async () => {
    const db = dbRef.current;
    if (!db || !routeFileId) return;
    const newValue = !isPrivate;
    setIsPrivate(newValue);
    try {
      await db.setPrivate(routeFileId, newValue);
      notifications.show({ title: newValue ? 'Private' : 'Public', message: newValue ? 'Only you can view this file.' : 'Anyone with the link can view this file.', color: 'blue' });
    } catch (err) {
      setIsPrivate(isPrivate);
      notifications.show({ title: 'Failed to update privacy', message: friendlyError(err), color: 'red' });
    }
  }, [routeFileId, isPrivate]);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.replace(/\.[^.]+$/, '');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileId(name);
      localStorage.setItem('esvg-local-id', name);
      setSvgCode(formatXml(stripBom(ev.target?.result as string)));
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleDownload = useCallback(() => {
    const uniqueId = routeFileId || getNewUniqueId();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:image/svg+xml;base64,' + window.btoa(svgCode));
    element.setAttribute('download', uniqueId + '.svg');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [svgCode, routeFileId]);

  const handleElementSelect = useCallback((tagName: string, index: number) => {
    if (!tagName || index < 0) {
      editorRef.current?.clearSelection();
      setSelectedElement(undefined);
      setSelectedLineRange(undefined);
      setSelectedXPath(undefined);
      return;
    }
    const range = findElementRange(svgCode, tagName, index);
    if (!range) return;
    editorRef.current?.selectRange(range.startLine, range.startCol, range.endLine, range.endCol);
    setSelectedElement(svgCode.substring(range.startOffset, range.endOffset));
    setSelectedLineRange({ start: range.startLine, end: range.endLine });
    // Don't set xpath — selection came from Preview click, it's already highlighted there
    setSelectedXPath(undefined);
  }, [svgCode]);

  const handleCursorElement = useCallback((element: string | undefined, lineRange: { start: number; end: number } | undefined, xpath: string | undefined) => {
    const isRootSvg = xpath && /^\/svg\[\d+\]$/.test(xpath);
    setSelectedElement(isRootSvg ? undefined : element);
    setSelectedLineRange(isRootSvg ? undefined : lineRange);
    setSelectedXPath(isRootSvg ? undefined : xpath);
  }, []);

  const handlePreviewSvg = useCallback((svg: string | null) => {
    if (!svg) {
      clearProposal();
    } else {
      setProposedSvg(svg);
    }
  }, [clearProposal]);

  const handleAcceptSvg = useCallback((svg: string) => {
    pushCheckpoint(svgCode, fileId).then(() => setCanUndo(true));
    setSvgCode(svg);
    clearProposal();
  }, [svgCode, fileId, clearProposal]);

  const handleUndo = useCallback(async (popCount: number) => {
    const prev = await popCheckpoints(popCount, fileId);
    if (prev) {
      setSvgCode(prev);
      clearProposal();
    }
    setCanUndo(await hasCheckpoints(fileId));
  }, [fileId]);

  const handleDeleteElement = useCallback(() => {
    if (!selectedLineRange) return;
    const lines = svgCode.split('\n');
    lines.splice(selectedLineRange.start - 1, selectedLineRange.end - selectedLineRange.start + 1);
    setSvgCode(lines.join('\n'));
    setSelectedElement(undefined);
    setSelectedLineRange(undefined);
    setSelectedXPath(undefined);
  }, [svgCode, selectedLineRange]);

  const handleNew = useCallback(() => {
    setSvgCode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">\n\n</svg>');
  }, []);

  const handleOpenCommandPalette = useCallback(() => {
    editorRef.current?.openCommandPalette();
  }, []);

  const handleEditorUndo = useCallback(() => {
    editorRef.current?.undo();
  }, []);

  const handleEditorRedo = useCallback(() => {
    editorRef.current?.redo();
  }, []);

  const persistTab = useCallback((tab: string) => {
    sessionStorage.setItem('esvg-sidebar-tab', tab);
    const user = getAuth().currentUser;
    if (user && !user.isAnonymous) {
      localStorage.setItem('esvg-sidebar-tab', tab);
    } else {
      localStorage.removeItem('esvg-sidebar-tab');
    }
  }, []);

  const switchToInfo = useCallback(() => {
    setSidebarTab('info');
    persistTab('info');
  }, [persistTab]);

  const switchToAi = useCallback(() => {
    setSidebarTab('ai');
    persistTab('ai');
  }, [persistTab]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Allotment>
        <Allotment.Pane preferredSize="45%">
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Group gap="xs" px={8} py={4} style={{ backgroundColor: 'var(--mantine-color-dark-7)', borderBottom: '1px solid var(--mantine-color-dark-4)', flexShrink: 0 }}>
              <Tooltip label="Create a blank SVG document">
                <Button variant="subtle" color="gray" size="compact-xs" leftSection={<IconFilePlus size={14} />} onClick={handleNew}>
                  New
                </Button>
              </Tooltip>
              <Tooltip label="Open an SVG file from your computer">
                <Button variant="subtle" color="gray" size="compact-xs" leftSection={<IconFolderOpen size={14} />} onClick={handleUpload}>
                  Open
                </Button>
              </Tooltip>
              <Tooltip label="Download the file to your computer">
                <Button variant="subtle" color="gray" size="compact-xs" leftSection={<IconDownload size={14} />} onClick={handleDownload}>
                  Download
                </Button>
              </Tooltip>
              <Tooltip label={routeFileId ? "Save changes" : "Save to the cloud"}>
                <Button variant="subtle" color="gray" size="compact-xs" leftSection={<IconCloudUpload size={14} />} onClick={handleSave} loading={saving}>
                  Save
                </Button>
              </Tooltip>
              {routeFileId && (
                <Tooltip label={isPrivate ? 'Private — only you can view. Click to make public.' : 'Public — anyone with the link can view. Click to make private.'}>
                  <ActionIcon variant="subtle" color={isPrivate ? 'gray' : 'blue'} size="sm" onClick={handleTogglePrivate}>
                    {isPrivate ? <IconLock size={14} /> : <IconWorld size={14} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
            <div style={{ flex: 1 }}>
              {proposedSvg && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Group gap="xs" p={4} style={{ backgroundColor: 'var(--mantine-color-dark-7)', borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
                    <Text size="xs" c="dimmed" fw={600}>AI Proposal — accept or reject in chat</Text>
                  </Group>
                  <div style={{ flex: 1 }}>
                    <DiffEditor
                      original={svgCode}
                      modified={proposedSvg}
                      language="xml"
                      theme="vs-dark"
                      options={{ readOnly: true, renderSideBySide: false }}
                      onMount={handleDiffMount}
                    />
                  </div>
                </div>
              )}
              <div style={{ height: '100%', display: proposedSvg ? 'none' : 'block' }}>
                <Editor ref={editorRef} value={svgCode} onChange={setSvgCode} readOnly={readOnly} onCursorElement={handleCursorElement} />
              </div>
            </div>
          </div>
        </Allotment.Pane>
        <Allotment.Pane preferredSize="45%">
          <Preview svgCode={proposedSvg ?? svgCode} onElementSelect={handleElementSelect} selectedXPath={selectedXPath} onDeleteElement={selectedLineRange ? handleDeleteElement : undefined} onUndo={handleEditorUndo} onRedo={handleEditorRedo} />
        </Allotment.Pane>
        <Allotment.Pane preferredSize="15%" minSize={320}>
          <div style={{ display: 'flex', height: '100%', backgroundColor: 'var(--mantine-color-body)' }}>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', display: sidebarTab === 'ai' ? 'block' : 'none' }}>
                <AiChat
                  svgCode={svgCode}
                  fileId={fileId}
                  selectedElement={selectedElement}
                  selectedLineRange={selectedLineRange}
                  onPreviewSvg={handlePreviewSvg}
                  onAcceptSvg={handleAcceptSvg}
                  onRestore={handleUndo}
                  canUndo={canUndo}
                />
              </div>
              <div style={{ height: '100%', display: sidebarTab === 'info' ? 'block' : 'none' }}>
                <Sidebar onOpenCommandPalette={handleOpenCommandPalette} onOpenAiChat={switchToAi} />
              </div>
            </div>
            <div className="activity-bar">
              <Tooltip label="Info" position="left">
                <ActionIcon
                  variant={sidebarTab === 'info' ? 'light' : 'subtle'}
                  color={sidebarTab === 'info' ? 'blue' : 'gray'}
                  size="lg"
                  onClick={switchToInfo}
                >
                  <IconInfoCircle size={20} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="AI Chat" position="left">
                  <ActionIcon
                    data-teaching-anchor="ai-chat"
                    variant={sidebarTab === 'ai' ? 'light' : 'subtle'}
                    color={sidebarTab === 'ai' ? 'blue' : 'gray'}
                    size="lg"
                    onClick={switchToAi}
                  >
                    <IconSparkles size={20} />
                  </ActionIcon>
                </Tooltip>
              <TeachingBubble anchorSelector='[data-teaching-anchor="ai-chat"]' active={sidebarTab === 'ai'} onActivate={switchToAi} />
            </div>
          </div>
        </Allotment.Pane>
      </Allotment>
    </>
  );
}

import { useState, useCallback, useRef, useEffect } from 'react';
import { AppShell, Group, ActionIcon, Button, Text, Tooltip } from '@mantine/core';
import { IconFolderOpen, IconDownload, IconCloudUpload, IconBrandGithub, IconBug, IconSparkles, IconInfoCircle } from '@tabler/icons-react';
import { Allotment } from 'allotment';
import { DiffEditor } from '@monaco-editor/react';
import { Editor, type EditorHandle } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { AiChat } from './components/AiChat';
import { EditSvgCodeDb } from './lib/firebase';
import { getUniqueId, getNewUniqueId, stripBom, findElementRange } from './lib/svg-utils';
import { saveSvgCode, loadSvgCode, pushCheckpoint, popCheckpoints, hasCheckpoints } from './lib/chat-storage';
import './App.css';

const DEFAULT_SVG = `<!-- sample rectangle -->
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" x="50" y="50" fill="red" />
</svg>`;

export default function App() {
  const [svgCode, setSvgCode] = useState('Loading please wait...');
  const [readOnly, setReadOnly] = useState(true);
  const [saving, setSaving] = useState(false);
  const dbRef = useRef<EditSvgCodeDb | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<EditorHandle>(null);
  const [sidebarTab, setSidebarTab] = useState<string>('info');
  const [selectedElement, setSelectedElement] = useState<string | undefined>();
  const [selectedLineRange, setSelectedLineRange] = useState<{ start: number; end: number } | undefined>();
  const [canUndo, setCanUndo] = useState(false);
  const [proposedSvg, setProposedSvg] = useState<string | null>(null);

  // Clear selection when SVG code changes (avoids stale reference)
  useEffect(() => {
    setSelectedElement(undefined);
    setSelectedLineRange(undefined);
  }, [svgCode]);

  // Persist SVG to IndexedDB so it matches chat history on reload
  useEffect(() => {
    if (!readOnly) saveSvgCode(svgCode);
  }, [svgCode, readOnly]);

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
      const uniqueId = getUniqueId();
      // Try restoring SVG from IndexedDB (matches chat history)
      const savedSvg = await loadSvgCode();
      setCanUndo(await hasCheckpoints());
      if (savedSvg && savedSvg.includes('<svg')) {
        setSvgCode(savedSvg);
        setReadOnly(false);
      } else if (uniqueId) {
        db.loadDocument(uniqueId).then((text) => {
          setSvgCode(text || DEFAULT_SVG);
          setReadOnly(false);
        });
      } else {
        setSvgCode(DEFAULT_SVG);
        setReadOnly(false);
      }
    };

    document.addEventListener('dbinit', handleDbInit);
    return () => document.removeEventListener('dbinit', handleDbInit);
  }, []);

  const handleSave = useCallback(() => {
    const db = dbRef.current;
    if (!db) return;
    const uniqueId = getUniqueId() || getNewUniqueId();
    setSaving(true);
    db.saveDocument(uniqueId, svgCode)
      .then(() => {
        history.pushState({}, 'Saved', '/' + uniqueId);
      })
      .finally(() => setSaving(false));
  }, [svgCode]);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSvgCode(stripBom(ev.target?.result as string));
    };
    reader.readAsText(file);
    // Reset so the same file can be uploaded again
    e.target.value = '';
  }, []);

  const handleDownload = useCallback(() => {
    const uniqueId = getUniqueId() || getNewUniqueId();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:image/svg+xml;base64,' + window.btoa(svgCode));
    element.setAttribute('download', uniqueId + '.svg');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [svgCode]);

  // Click-to-select: find the Nth occurrence of <tagName in source and select the full element
  const handleElementSelect = useCallback((tagName: string, index: number) => {
    if (!tagName || index < 0) {
      editorRef.current?.clearSelection();
      setSelectedElement(undefined);
      setSelectedLineRange(undefined);
      return;
    }
    const range = findElementRange(svgCode, tagName, index);
    if (!range) return;
    editorRef.current?.selectRange(range.startLine, range.startCol, range.endLine, range.endCol);
    // Extract the exact selected element text for AI context
    setSelectedElement(svgCode.substring(range.startOffset, range.endOffset));
    setSelectedLineRange({ start: range.startLine, end: range.endLine });
  }, [svgCode]);

  const handlePreviewSvg = useCallback((svg: string | null) => {
    setProposedSvg(svg);
  }, []);

  const handleAcceptSvg = useCallback((svg: string) => {
    pushCheckpoint(svgCode).then(() => setCanUndo(true));
    setSvgCode(svg);
    setProposedSvg(null);
  }, [svgCode]);

  const handleUndo = useCallback(async (popCount: number) => {
    const prev = await popCheckpoints(popCount);
    if (prev) {
      setSvgCode(prev);
      setProposedSvg(null);
    }
    setCanUndo(await hasCheckpoints());
  }, []);

  return (
    <AppShell
      header={{ height: 50 }}
      footer={{ height: 22 }}
      padding={0}
    >
      <AppShell.Header
        style={{ backgroundColor: 'var(--mantine-color-dark-7)', borderBottom: '1px solid var(--mantine-color-dark-4)' }}
      >
        <Group h="100%" px="md">
          <Text fw={700} size="lg" c="white">Online SVG code editor</Text>
          <Group gap="xs">
            <Tooltip label="Open an SVG file from your computer">
              <Button variant="outline" color="gray" size="sm" leftSection={<IconFolderOpen size={16} />} onClick={handleUpload}>
                Open...
              </Button>
            </Tooltip>
            <Tooltip label="Download the file to your computer">
              <Button variant="outline" color="gray" size="sm" leftSection={<IconDownload size={16} />} onClick={handleDownload}>
                Download
              </Button>
            </Tooltip>
            <Tooltip label="Share: save to the cloud and get a link">
              <Button variant="outline" color="gray" size="sm" leftSection={<IconCloudUpload size={16} />} onClick={handleSave} loading={saving}>
                Share
              </Button>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ backgroundColor: 'var(--mantine-color-body)' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/svg+xml"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <Allotment>
          <Allotment.Pane preferredSize="45%">
            {proposedSvg ? (
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
                  />
                </div>
              </div>
            ) : (
              <Editor ref={editorRef} value={svgCode} onChange={setSvgCode} readOnly={readOnly} />
            )}
          </Allotment.Pane>
          <Allotment.Pane preferredSize="45%">
            <Preview svgCode={proposedSvg ?? svgCode} onElementSelect={handleElementSelect} />
          </Allotment.Pane>
          <Allotment.Pane preferredSize="10%" minSize={250}>
            <div style={{ display: 'flex', height: '100%', backgroundColor: 'var(--mantine-color-body)' }}>
              <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', display: sidebarTab === 'ai' ? 'block' : 'none' }}>
                  <AiChat
                    svgCode={svgCode}
                    selectedElement={selectedElement}
                    selectedLineRange={selectedLineRange}
                    onPreviewSvg={handlePreviewSvg}
                    onAcceptSvg={handleAcceptSvg}
                    onRestore={handleUndo}
                    canUndo={canUndo}
                  />
                </div>
                <div style={{ height: '100%', display: sidebarTab === 'info' ? 'block' : 'none' }}>
                  <Sidebar onOpenCommandPalette={() => editorRef.current?.openCommandPalette()} />
                </div>
              </div>
              <div className="activity-bar">
                <Tooltip label="Info" position="left">
                  <ActionIcon
                    variant={sidebarTab === 'info' ? 'light' : 'subtle'}
                    color={sidebarTab === 'info' ? 'blue' : 'gray'}
                    size="lg"
                    onClick={() => setSidebarTab('info')}
                  >
                    <IconInfoCircle size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="AI Chat" position="left">
                  <ActionIcon
                    variant={sidebarTab === 'ai' ? 'light' : 'subtle'}
                    color={sidebarTab === 'ai' ? 'blue' : 'gray'}
                    size="lg"
                    onClick={() => setSidebarTab('ai')}
                  >
                    <IconSparkles size={20} />
                  </ActionIcon>
                </Tooltip>
              </div>
            </div>
          </Allotment.Pane>
        </Allotment>
      </AppShell.Main>

      <AppShell.Footer
        style={{ backgroundColor: 'var(--mantine-color-dark-7)', borderTop: '1px solid var(--mantine-color-dark-4)' }}
      >
        <Group h="100%" px="xs" justify="space-between">
          <Group gap="xs">
            <Text size="xs" c="dimmed">v{__APP_VERSION__}</Text>
            <Text size="xs" c="dimmed">
              <Text component="a" href="https://unmanagedvisio.com" target="_blank" size="xs" c="dimmed" td="underline">
                Nikolay Belykh
              </Text>
            </Text>
            <Text component="a" href="/privacy-policy.md" target="_blank" size="xs" c="dimmed" td="underline">
              Privacy
            </Text>
          </Group>
          <Group gap="xs">
            <Text
              component="a"
              href="https://github.com/nbelyh/editsvgcode/issues"
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              c="dimmed"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
            >
              <IconBug size={12} />
            </Text>
            <Text
              component="a"
              href="https://github.com/nbelyh/editsvgcode"
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              c="dimmed"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
            >
              <IconBrandGithub size={12} />
            </Text>
          </Group>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}

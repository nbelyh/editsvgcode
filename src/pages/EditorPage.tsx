import { useState, useCallback, useRef, useEffect } from 'react';
import { Group, ActionIcon, Text, Tooltip, useComputedColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconSparkles, IconInfoCircle } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { Allotment } from 'allotment';
import { DiffEditor } from '@monaco-editor/react';
import { Editor, type EditorHandle } from '../components/Editor';
import { EditorToolbar } from '../components/EditorToolbar';
import { Preview } from '../components/Preview';
import { Sidebar } from '../components/Sidebar';
import { TeachingBubble } from '../components/TeachingBubble';
import { AiChat } from '../components/aichat';
import { useDocument } from '../lib/useDocument';
import { findElementRange } from '../lib/svg-utils';
import { getAuth } from 'firebase/auth';

export function EditorPage() {
  const { fileId: routeFileId } = useParams<{ fileId?: string }>();

  const {
    svgCode, setSvgCode,
    readOnly, saving, isPrivate, isAnonymous, fileId, canUndo, proposedSvg,
    handleDiffMount, handleSave, handleTogglePrivate,
    handleFileChange, handleDownload, handleNew,
    handlePreviewSvg, handleAcceptSvg, handleUndo,
  } = useDocument(routeFileId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<EditorHandle>(null);
  const [sidebarTab, setSidebarTab] = useState<string>(() =>
    localStorage.getItem('esvg-sidebar-tab') || sessionStorage.getItem('esvg-sidebar-tab') || 'info'
  );
  const [selectedElement, setSelectedElement] = useState<string | undefined>();
  const [selectedLineRange, setSelectedLineRange] = useState<{ start: number; end: number } | undefined>();
  const [selectedXPath, setSelectedXPath] = useState<string | undefined>();
  const [showPreview, setShowPreview] = useState(() => localStorage.getItem('esvg-show-preview') !== 'false');
  const [showSidebar, setShowSidebar] = useState(() => localStorage.getItem('esvg-show-sidebar') !== 'false');
  const isDesktop = useMediaQuery('(min-width: 64em)');
  const isPhone = useMediaQuery('(max-width: 35.99em)');

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

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

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
    setSelectedXPath(undefined);
  }, [svgCode]);

  const handleCursorElement = useCallback((element: string | undefined, lineRange: { start: number; end: number } | undefined, xpath: string | undefined) => {
    const isRootSvg = xpath && /^\/svg\[\d+\]$/.test(xpath);
    setSelectedElement(isRootSvg ? undefined : element);
    setSelectedLineRange(isRootSvg ? undefined : lineRange);
    setSelectedXPath(isRootSvg ? undefined : xpath);
  }, []);

  const handleDeleteElement = useCallback(() => {
    if (!selectedLineRange) return;
    const lines = svgCode.split('\n');
    lines.splice(selectedLineRange.start - 1, selectedLineRange.end - selectedLineRange.start + 1);
    setSvgCode(lines.join('\n'));
    setSelectedElement(undefined);
    setSelectedLineRange(undefined);
    setSelectedXPath(undefined);
  }, [svgCode, selectedLineRange, setSvgCode]);

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

  const togglePreview = useCallback(() => {
    setShowPreview(prev => {
      const next = !prev;
      localStorage.setItem('esvg-show-preview', String(next));
      return next;
    });
  }, []);

  const switchToInfo = useCallback(() => {
    if (sidebarTab === 'info' && showSidebar) {
      setShowSidebar(false);
      localStorage.setItem('esvg-show-sidebar', 'false');
    } else {
      setSidebarTab('info');
      persistTab('info');
      setShowSidebar(true);
      localStorage.setItem('esvg-show-sidebar', 'true');
    }
  }, [persistTab, sidebarTab, showSidebar]);

  const switchToAi = useCallback(() => {
    if (sidebarTab === 'ai' && showSidebar) {
      setShowSidebar(false);
      localStorage.setItem('esvg-show-sidebar', 'false');
    } else {
      setSidebarTab('ai');
      persistTab('ai');
      setShowSidebar(true);
      localStorage.setItem('esvg-show-sidebar', 'true');
    }
  }, [persistTab, sidebarTab, showSidebar]);

  const computedColorScheme = useComputedColorScheme('dark');
  const monacoTheme = computedColorScheme === 'dark' ? 'vs-dark' : 'vs';

  const sharedInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/svg+xml"
      style={{ display: 'none' }}
      onChange={handleFileChange}
    />
  );

  const sharedToolbar = (
    <EditorToolbar
      onNew={handleNew}
      onUpload={handleUpload}
      onDownload={handleDownload}
      onSave={handleSave}
      saving={saving}
      routeFileId={routeFileId}
      isPrivate={isPrivate}
      isAnonymous={isAnonymous}
      onTogglePrivate={handleTogglePrivate}
      showPreview={showPreview}
      onTogglePreview={togglePreview}
      showPreviewToggle={false}
    />
  );

  const aiChatPanel = (
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
  );

  const previewPanel = (
    <Preview
      svgCode={proposedSvg ?? svgCode}
      onElementSelect={handleElementSelect}
      selectedXPath={selectedXPath}
      onDeleteElement={selectedLineRange ? handleDeleteElement : undefined}
      onUndo={handleEditorUndo}
      onRedo={handleEditorRedo}
    />
  );

  if (!isDesktop) {
    if (isPhone) {
      // Phone: preview (30%) stacked over AI chat
      return (
        <>
          {sharedInput}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {sharedToolbar}
            <div style={{ flex: '0 0 30%', minHeight: 0, overflow: 'hidden' }}>
              {previewPanel}
            </div>
            <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden', borderTop: '1px solid var(--esvg-chrome-border)' }}>
              {aiChatPanel}
            </div>
          </div>
        </>
      );
    }

    // Tablet: preview (60%) + code on the left, AI chat sidebar on the right
    return (
      <>
        {sharedInput}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {sharedToolbar}
          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ flex: '0 0 60%', minHeight: 0, overflow: 'hidden' }}>
                {previewPanel}
              </div>
              <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden', borderTop: '1px solid var(--esvg-chrome-border)', display: 'flex', flexDirection: 'column' }}>
                {proposedSvg ? (
                  <>
                    <Group gap="xs" p={4} style={{ backgroundColor: 'var(--esvg-chrome-bg)', borderBottom: '1px solid var(--esvg-chrome-border)' }}>
                      <Text size="xs" c="dimmed" fw={600}>AI Proposal — accept or reject in chat</Text>
                    </Group>
                    <div style={{ flex: 1 }}>
                      <DiffEditor
                        original={svgCode}
                        modified={proposedSvg}
                        language="xml"
                        theme={monacoTheme}
                        options={{ readOnly: true, renderSideBySide: false }}
                        onMount={handleDiffMount}
                      />
                    </div>
                  </>
                ) : (
                  <Editor ref={editorRef} value={svgCode} onChange={setSvgCode} readOnly={readOnly} theme={monacoTheme} onCursorElement={handleCursorElement} />
                )}
              </div>
            </div>
            <div style={{ flex: '0 0 320px', minWidth: 0, overflow: 'hidden', borderLeft: '1px solid var(--esvg-chrome-border)' }}>
              {aiChatPanel}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div style={{ display: 'flex', height: '100%' }}>
      <Allotment>
        <Allotment.Pane preferredSize="45%">
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <EditorToolbar
              onNew={handleNew}
              onUpload={handleUpload}
              onDownload={handleDownload}
              onSave={handleSave}
              saving={saving}
              routeFileId={routeFileId}
              isPrivate={isPrivate}
              isAnonymous={isAnonymous}
              onTogglePrivate={handleTogglePrivate}
              showPreview={showPreview}
              onTogglePreview={togglePreview}
            />
            <div style={{ flex: 1 }}>
              {proposedSvg && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Group gap="xs" p={4} style={{ backgroundColor: 'var(--esvg-chrome-bg)', borderBottom: '1px solid var(--esvg-chrome-border)' }}>
                    <Text size="xs" c="dimmed" fw={600}>AI Proposal — accept or reject in chat</Text>
                  </Group>
                  <div style={{ flex: 1 }}>
                    <DiffEditor
                      original={svgCode}
                      modified={proposedSvg}
                      language="xml"
                      theme={monacoTheme}
                      options={{ readOnly: true, renderSideBySide: false }}
                      onMount={handleDiffMount}
                    />
                  </div>
                </div>
              )}
              <div style={{ height: '100%', display: proposedSvg ? 'none' : 'block' }}>
                <Editor ref={editorRef} value={svgCode} onChange={setSvgCode} readOnly={readOnly} theme={monacoTheme} onCursorElement={handleCursorElement} />
              </div>
            </div>
          </div>
        </Allotment.Pane>
        <Allotment.Pane preferredSize="45%" visible={showPreview}>
          <Preview svgCode={proposedSvg ?? svgCode} onElementSelect={handleElementSelect} selectedXPath={selectedXPath} onDeleteElement={selectedLineRange ? handleDeleteElement : undefined} onUndo={handleEditorUndo} onRedo={handleEditorRedo} />
        </Allotment.Pane>
        <Allotment.Pane preferredSize="15%" minSize={320} visible={showSidebar}>
          <div style={{ height: '100%', overflow: 'hidden', position: 'relative', backgroundColor: 'var(--mantine-color-body)' }}>
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
        </Allotment.Pane>
      </Allotment>
        <div className="activity-bar">
              <Tooltip label="Info" position="left">
                <ActionIcon
                  variant={sidebarTab === 'info' && showSidebar ? 'light' : 'subtle'}
                  color={sidebarTab === 'info' && showSidebar ? 'blue' : 'gray'}
                  size="lg"
                  onClick={switchToInfo}
                >
                  <IconInfoCircle size={20} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="AI Chat" position="left">
                  <ActionIcon
                    data-teaching-anchor="ai-chat"
                    variant={sidebarTab === 'ai' && showSidebar ? 'light' : 'subtle'}
                    color={sidebarTab === 'ai' && showSidebar ? 'blue' : 'gray'}
                    size="lg"
                    onClick={switchToAi}
                  >
                    <IconSparkles size={20} />
                  </ActionIcon>
                </Tooltip>
              <TeachingBubble anchorSelector='[data-teaching-anchor="ai-chat"]' active={sidebarTab === 'ai'} onActivate={switchToAi} />
            </div>
      </div>
    </>
  );
}

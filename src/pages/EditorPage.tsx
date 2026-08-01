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
import { ForeignDocNotice } from '../components/ForeignDocNotice';
import { FOREIGN_DOC_INFO_NOTICE } from '../lib/visibility';
import { usePageMeta } from '../components/PageMeta';
import { CarbonAd } from '../components/CarbonAd';
import { TeachingBubble } from '../components/TeachingBubble';
import { AiChat } from '../components/aichat';
import { PublishDialog } from '../components/PublishDialog';
import { useDocument } from '../lib/useDocument';
import { useCloneDocument } from '../lib/useCloneDocument';
import { findElementRange } from '../lib/svg-utils';
import { getAuth } from 'firebase/auth';

export function EditorPage() {
  const { fileId: routeFileId } = useParams<{ fileId?: string }>();

  const {
    svgCode, setSvgCode,
    readOnly, saving, visibility, isAnonymous, isOwner, fileId, proposedSvg,
    downloadName, galleryMeta, publishDialogOpen, openPublishDialog, closePublishDialog,
    handlePublish, handleEditGalleryMeta,
    handleDiffMount, handleSave, handleSetVisibility,
    handleFileChange, handleDownload, handleNew,
    handlePreviewSvg, handleAcceptSvg, handleUndo,
  } = useDocument(routeFileId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<EditorHandle>(null);
  // AI chat is the default panel: it is what the editor is for, and the Info
  // tab is reference material a returning user does not need re-shown. A stored
  // preference still wins, so anyone who picked Info keeps it.
  const [sidebarTab, setSidebarTab] = useState<string>(() =>
    localStorage.getItem('esvg-sidebar-tab') || sessionStorage.getItem('esvg-sidebar-tab') || 'ai'
  );
  // Only gallery-published drawings get their own tags and a place in the
  // index. An unlisted document is reachable by link but deliberately not
  // listed, and the :fileId route answers 200 for ids that do not exist — both
  // would otherwise be indexed as another copy of the editor. `readOnly` is
  // still true while the document loads, so wait rather than publish a title
  // built from empty meta.
  const documentLoaded = !readOnly;
  const isPublished = documentLoaded && !!routeFileId && visibility === 'public';
  // noindex is NOT gated on the document having loaded: if the load never
  // finishes (offline, anonymous auth blocked) readOnly stays true, and gating
  // on it would leave a private or nonexistent document indexable. Fail closed
  // — anything under /:fileId is noindex until it is known to be published.
  // A hook, not a rendered <PageMeta>: this component returns from three
  // branches and the tag would only apply to whichever one rendered it.
  usePageMeta({
    title: isPublished ? galleryMeta.title || 'Untitled drawing' : undefined,
    description: isPublished ? galleryMeta.description || undefined : undefined,
    noindex: !!routeFileId && !isPublished,
  });

  // Resolved by the AI chat and mirrored onto the Info tab.
  const [isViewer, setIsViewer] = useState(false);
  // One clone-in-progress state for both panels, which offer the same action.
  const { clone, cloningId } = useCloneDocument();
  const startFromThis = useCallback(() => clone(fileId), [clone, fileId]);
  const [selectedElement, setSelectedElement] = useState<string | undefined>();
  const [selectedLineRange, setSelectedLineRange] = useState<{ start: number; end: number } | undefined>();
  const [selectedXPath, setSelectedXPath] = useState<string | undefined>();
  const [showPreview, setShowPreview] = useState(() => localStorage.getItem('esvg-show-preview') !== 'false');
  const [showSidebar, setShowSidebar] = useState(() => localStorage.getItem('esvg-show-sidebar') !== 'false');
  // Resolved during render, not in an effect. Left to default, both report
  // false on the first pass and the tablet branch below runs — which mounts the
  // editor. On a phone that branch is then thrown away, but @monaco-editor's
  // loader has already started and the fetch completes regardless: ~1 MB, 73%
  // of everything a phone downloads, for an editor the phone layout never
  // shows. Reading matchMedia synchronously picks the right branch first time.
  const isDesktop = useMediaQuery('(min-width: 64em)', undefined, { getInitialValueInEffect: false });
  const isPhone = useMediaQuery('(max-width: 35.99em)', undefined, { getInitialValueInEffect: false });
  // Carbon's placement policy forbids serving an ad that is concealed rather
  // than shown, so each branch withholds this while its pane is collapsed —
  // see the desktop layout, which gates it on showSidebar.
  //
  // This used to be held back for one render as well. The layout is now chosen
  // during the first render, so there is no longer a pass on the wrong branch
  // to mount a second host through.
  const adSlot = <CarbonAd />;

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

  // Opening a shared link should land on the conversation that produced the
  // drawing, not the info tab — but only until the visitor picks a tab
  // themselves, and without overwriting their stored preference.
  const tabChosenRef = useRef(false);
  useEffect(() => { tabChosenRef.current = false; }, [routeFileId]);

  const handleChatLoaded = useCallback((hasMessages: boolean) => {
    if (!routeFileId || !hasMessages || tabChosenRef.current) return;
    setSidebarTab('ai');
    setShowSidebar(true);
  }, [routeFileId]);

  const switchToInfo = useCallback(() => {
    tabChosenRef.current = true;
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

  // Whenever the AI panel is on screen the caret belongs in the composer —
  // opening the tab, or arriving with it already open, both mean the same thing.
  // In an effect rather than in switchToAi because the panel is display:none
  // until the state change commits, and a hidden element cannot take focus.
  // Desktop only: the phone and tablet layouts show the chat unconditionally,
  // and focusing on load there would raise the on-screen keyboard.
  useEffect(() => {
    if (!isDesktop || sidebarTab !== 'ai' || !showSidebar) return;
    document.querySelector<HTMLTextAreaElement>('.aui-composer-input')?.focus();
  }, [isDesktop, sidebarTab, showSidebar]);

  const switchToAi = useCallback(() => {
    tabChosenRef.current = true;
    if (sidebarTab === 'ai' && showSidebar) {
      setShowSidebar(false);
      localStorage.setItem('esvg-show-sidebar', 'false');
    } else {
      setSidebarTab('ai');
      persistTab('ai');
      setShowSidebar(true);
      localStorage.setItem('esvg-show-sidebar', 'true');
      // The effect above lands the caret in the composer once this commits.
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

  const publishDialog = (
    <PublishDialog
      opened={publishDialogOpen}
      onClose={closePublishDialog}
      fileId={routeFileId || fileId}
      svg={svgCode}
      fileName={downloadName ?? undefined}
      initialMeta={galleryMeta}
      mode={visibility === 'public' ? 'edit' : 'publish'}
      onSubmit={visibility === 'public' ? handleEditGalleryMeta : handlePublish}
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
      visibility={visibility}
      isAnonymous={isAnonymous}
      isOwner={isOwner}
      onSetVisibility={handleSetVisibility}
      onEditMeta={openPublishDialog}
      showPreview={showPreview}
      onTogglePreview={togglePreview}
      showPreviewToggle={false}
    />
  );

  const aiChatPanel = (
    <AiChat
      svgCode={svgCode}
      fileId={fileId}
      documentReady={!readOnly}
      selectedElement={selectedElement}
      selectedLineRange={selectedLineRange}
      onPreviewSvg={handlePreviewSvg}
      onAcceptSvg={handleAcceptSvg}
      onRestore={handleUndo}
      onChatLoaded={handleChatLoaded}
      onAccessResolved={setIsViewer}
      onStartFrom={startFromThis}
      cloning={cloningId === fileId}
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
          {publishDialog}
          {/* Scrolls, unlike the other two layouts. The editor itself keeps the
              whole viewport — the inner column is 100% tall — and the ad sits
              below it, so it costs no screen space and is found by scrolling.
              Carbon's mobile rule is "within 3x the viewport height from the
              top", not "on screen", so one screen down is well inside it. */}
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {sharedToolbar}
              <div style={{ flex: '0 0 30%', minHeight: 0, overflow: 'hidden' }}>
                {previewPanel}
              </div>
              <div style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden', borderTop: '1px solid var(--esvg-chrome-border)' }}>
                {aiChatPanel}
              </div>
            </div>
            {adSlot}
          </div>
        </>
      );
    }

    // Tablet: preview (60%) + code on the left, AI chat sidebar on the right
    return (
      <>
        {sharedInput}
        {publishDialog}
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
            <div style={{ flex: '0 0 320px', minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--esvg-chrome-border)' }}>
              <div style={{ flex: 1, minHeight: 0 }}>{aiChatPanel}</div>
              {adSlot}
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
      {publishDialog}
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
              visibility={visibility}
              isAnonymous={isAnonymous}
              isOwner={isOwner}
              onSetVisibility={handleSetVisibility}
              onEditMeta={openPublishDialog}
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
          <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mantine-color-body)' }}>
              <div style={{ flex: 1, minHeight: 0, display: sidebarTab === 'ai' ? 'block' : 'none' }}>
                {aiChatPanel}
              </div>
              <div style={{ flex: 1, minHeight: 0, display: sidebarTab === 'info' ? 'block' : 'none' }}>
                <Sidebar
                  onOpenCommandPalette={handleOpenCommandPalette}
                  onOpenAiChat={switchToAi}
                  notice={isViewer && (
                    // Mirrors the chat panel's read-only bar. A visitor who
                    // lands on a shared link and never opens the AI tab would
                    // otherwise edit away and only discover the document is not
                    // theirs when saving fails.
                    <ForeignDocNotice
                      message={FOREIGN_DOC_INFO_NOTICE}
                      onStartFrom={startFromThis}
                      cloning={cloningId === fileId}
                    />
                  )}
                />
              </div>
              {showSidebar && adSlot}
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

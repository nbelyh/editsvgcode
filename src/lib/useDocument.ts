import { useState, useCallback, useRef, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import type { DiffOnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { EditSvgCodeDb, friendlyError, logError, type Visibility, type GalleryMeta } from './firebase';
import { VISIBILITY_LABEL, VISIBILITY_MESSAGE } from './visibility';
import { submitGalleryMeta } from './publish';
import { trackSave, trackDownload, trackFileOpen } from './analytics';
import { getNewUniqueId, isCleanId, stripBom, formatXml } from './svg-utils';
import { saveSvgCode, loadSvgCode, migrateChatData } from './chat-storage';
import { scheduleDraftSvgSave, primeDraftSvg } from './chat-history';
import { getAuth } from 'firebase/auth';
import DEFAULT_SVG from '../assets/default.svg?raw';

// Re-exported for existing consumers; the strings live in visibility.ts.
export { VISIBILITY_LABEL, VISIBILITY_MESSAGE } from './visibility';

export function useDocument(routeFileId: string | undefined) {
  const navigate = useNavigate();

  const [svgCode, setSvgCode] = useState('Loading please wait...');
  const [readOnly, setReadOnly] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>('private');
  // A document gets its permanent id at creation and keeps it through save — the
  // chat, blobs, and (once saved) the files/{id} doc all share it. No "_local_"
  // prefix and no id swap on save.
  const [fileId, setFileId] = useState(() => routeFileId || localStorage.getItem('esvg-local-id') || (() => {
    const id = getNewUniqueId();
    localStorage.setItem('esvg-local-id', id);
    return id;
  })());
  const [isOwner, setIsOwner] = useState(false);
  // Gallery card text of the loaded doc; edited via the publish dialog.
  const [galleryMeta, setGalleryMeta] = useState<GalleryMeta>({ title: '', description: '' });
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [proposedSvg, setProposedSvg] = useState<string | null>(null);
  // Preserve an uploaded file's original name for download (the id is a guid).
  const [downloadName, setDownloadName] = useState<string | null>(null);
  const dbRef = useRef<EditSvgCodeDb | null>(null);
  const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);

  const clearProposal = useCallback(() => {
    diffEditorRef.current?.setModel(null);
    diffEditorRef.current = null;
    setProposedSvg(null);
  }, []);

  const handleDiffMount: DiffOnMount = (ed) => {
    diffEditorRef.current = ed;
  };

  // Persist SVG to IndexedDB so it matches chat history on reload (the local
  // draft for anonymous users), and sync it to the server copy when one exists
  // (signed-in drafts/saved docs — no-op otherwise).
  useEffect(() => {
    if (!readOnly) {
      saveSvgCode(svgCode, fileId);
      scheduleDraftSvgSave(fileId, svgCode);
    }
  }, [svgCode, readOnly, fileId]);

  // An uploaded file's download name only applies to that upload — clear it
  // whenever we navigate to a different document. Also close the publish dialog
  // so a dialog left open on doc A can't submit against the newly-loaded doc B.
  useEffect(() => {
    setDownloadName(null);
    setPublishDialogOpen(false);
  }, [routeFileId]);

  // DB init / load
  useEffect(() => {
    const db = new EditSvgCodeDb();
    dbRef.current = db;

    const handleDbInit = async () => {
      const uniqueId = routeFileId || '';
      if (uniqueId) setFileId(uniqueId);
      const currentFileId = uniqueId || localStorage.getItem('esvg-local-id') || fileId;

      // Reset per-document state up front: only the success branch below sets
      // real values, so without this the not-found/denied/draft paths would
      // keep the PREVIOUS doc's visibility/meta/ownership — which would let a
      // later Save silently publish, and prefill the publish dialog wrongly.
      setVisibility('private');
      setGalleryMeta({ title: '', description: '' });
      setIsOwner(false);

      if (uniqueId) {
        try {
          const result = await db.loadDocument(uniqueId);
          if (result) {
            setVisibility(result.visibility);
            setGalleryMeta({ title: result.title, description: result.description });
            const currentUid = getAuth().currentUser?.uid ?? null;
            setIsOwner(currentUid !== null && result.uid === currentUid);
            db.incrementViews(uniqueId).catch((err) => logError('incrementViews', err));
            // Server text is the source of truth (edits/chat accepts sync it);
            // fall back to the local copy for docs that predate the sync.
            if (result.text && result.text.includes('<svg')) {
              const formatted = formatXml(result.text);
              primeDraftSvg(uniqueId, formatted);
              setSvgCode(formatted);
            } else {
              const savedSvg = await loadSvgCode(currentFileId);
              setSvgCode(savedSvg && savedSvg.includes('<svg') ? formatXml(savedSvg) : DEFAULT_SVG);
            }
          } else {
            setSvgCode(DEFAULT_SVG);
          }
        } catch {
          setSvgCode(DEFAULT_SVG);
          notifications.show({ title: 'Access denied', message: 'This file is private or does not exist.', color: 'red' });
        }
        setReadOnly(false);
      } else {
        // Unsaved draft: a signed-in user's draft may exist server-side (chat
        // syncs it) — that copy wins so the draft follows the account.
        let serverText: string | null = null;
        const user = getAuth().currentUser;
        if (user && !user.isAnonymous) {
          try {
            const result = await db.loadDocument(currentFileId, { quiet: true });
            if (result && result.uid === user.uid && result.text) serverText = result.text;
          } catch {
            // not found / not ours — use the local copy
          }
        }
        if (serverText && serverText.includes('<svg')) {
          const formatted = formatXml(serverText);
          primeDraftSvg(currentFileId, formatted);
          setSvgCode(formatted);
        } else {
          const savedSvg = await loadSvgCode(currentFileId);
          setSvgCode(savedSvg && savedSvg.includes('<svg') ? formatXml(savedSvg) : DEFAULT_SVG);
        }
        setReadOnly(false);
      }
    };

    if (getAuth().currentUser) {
      handleDbInit();
    }
    document.addEventListener('dbinit', handleDbInit);
    return () => document.removeEventListener('dbinit', handleDbInit);
  }, [routeFileId]);

  const isAnonymous = getAuth().currentUser?.isAnonymous ?? true;

  const handleSave = useCallback(async () => {
    const db = dbRef.current;
    if (!db) return;
    // The id is stable from creation, so saving normally reuses it. Guard: the
    // public id/URL must be a clean minted guid — a malformed id (legacy
    // "_local_…" or a stale filename) is replaced and its data migrated.
    let uniqueId = routeFileId || fileId;
    if (!isCleanId(uniqueId)) {
      const cleanId = getNewUniqueId();
      await migrateChatData(uniqueId, cleanId);
      uniqueId = cleanId;
    }
    setSaving(true);
    setFileId(uniqueId);
    // Anonymous users can't manage visibility — their saves are link-shareable
    // (unlisted), never gallery-listed.
    const effectiveVisibility: Visibility = getAuth().currentUser?.isAnonymous ? 'unlisted' : visibility;
    db.saveDocument(uniqueId, svgCode, effectiveVisibility)
      .then(() => {
        // Draft promoted to a saved file — forget the draft pointer so a fresh
        // "/" mints a new id instead of reopening this one.
        localStorage.removeItem('esvg-local-id');
        navigate('/' + uniqueId, { replace: true });
        trackSave();
        notifications.show({ title: 'Saved', message: 'File saved successfully.', color: 'green' });
      })
      .catch((err) => {
        notifications.show({ title: 'Save failed', message: friendlyError(err), color: 'red' });
      })
      .finally(() => setSaving(false));
  }, [svgCode, routeFileId, navigate, visibility, fileId]);

  const handleSetVisibility = useCallback(async (newValue: Visibility) => {
    const db = dbRef.current;
    if (!db || !routeFileId || newValue === visibility) return;
    // Anonymous users and non-owners cannot change visibility
    if (getAuth().currentUser?.isAnonymous) return;
    if (!isOwner) return;
    // Going public is confirmed through the publish dialog (title/description);
    // nothing is written until the user confirms there.
    if (newValue === 'public') {
      setPublishDialogOpen(true);
      return;
    }
    setVisibility(newValue);
    try {
      await db.setVisibility(routeFileId, newValue);
      notifications.show({
        title: VISIBILITY_LABEL[newValue],
        message: VISIBILITY_MESSAGE[newValue],
        color: 'blue',
      });
    } catch (err) {
      setVisibility(visibility);
      notifications.show({ title: 'Failed to update visibility', message: friendlyError(err), color: 'red' });
    }
  }, [routeFileId, visibility, isOwner]);

  /** Publish-dialog confirm: goes public with the entered title/description.
   * Rejections propagate — the dialog stays open and shows the error. */
  const handlePublish = useCallback(async (meta: GalleryMeta) => {
    if (!routeFileId) return;
    await submitGalleryMeta(routeFileId, 'publish', meta);
    setVisibility('public');
    setGalleryMeta(meta);
  }, [routeFileId]);

  /** Edit-gallery-info confirm for an already-published file. */
  const handleEditGalleryMeta = useCallback(async (meta: GalleryMeta) => {
    if (!routeFileId) return;
    await submitGalleryMeta(routeFileId, 'edit', meta);
    setGalleryMeta(meta);
  }, [routeFileId]);

  const openPublishDialog = useCallback(() => setPublishDialogOpen(true), []);
  const closePublishDialog = useCallback(() => setPublishDialogOpen(false), []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.replace(/\.[^.]+$/, '');
    const reader = new FileReader();
    reader.onload = (ev) => {
      // Uploaded files get a fresh permanent id (a filename is not a safe doc id
      // — it collides across users); keep the name only for download.
      const id = getNewUniqueId();
      setFileId(id);
      localStorage.setItem('esvg-local-id', id);
      setDownloadName(name);
      setSvgCode(formatXml(stripBom(ev.target?.result as string)));
      trackFileOpen('upload');
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleDownload = useCallback(() => {
    trackDownload();
    if (routeFileId) {
      dbRef.current?.incrementDownloads(routeFileId).catch((err) => logError('incrementDownloads', err));
    }
    const name = downloadName || routeFileId || fileId;
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', name + '.svg');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  }, [svgCode, routeFileId, fileId, downloadName]);

  const handleNew = useCallback(() => {
    setSvgCode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">\n\n</svg>');
  }, []);

  const handlePreviewSvg = useCallback((svg: string | null) => {
    if (!svg) {
      clearProposal();
    } else {
      setProposedSvg(svg);
    }
  }, [clearProposal]);

  const handleAcceptSvg = useCallback((svg: string) => {
    setSvgCode(svg);
    clearProposal();
  }, [clearProposal]);

  // Roll back to a snapshot carried by the chat (an accepted call's prevSvg).
  const handleUndo = useCallback((svg: string) => {
    setSvgCode(svg);
    clearProposal();
  }, [clearProposal]);

  return {
    svgCode, setSvgCode,
    readOnly,
    saving,
    visibility,
    isAnonymous,
    isOwner,
    fileId,
    downloadName,
    galleryMeta,
    publishDialogOpen,
    openPublishDialog,
    closePublishDialog,
    handlePublish,
    handleEditGalleryMeta,
    proposedSvg,
    handleDiffMount,
    handleSave,
    handleSetVisibility,
    handleFileChange,
    handleDownload,
    handleNew,
    handlePreviewSvg,
    handleAcceptSvg,
    handleUndo,
  };
}

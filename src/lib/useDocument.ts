import { useState, useCallback, useRef, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import type { DiffOnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { EditSvgCodeDb, friendlyError, logError } from './firebase';
import { trackSave, trackDownload, trackFileOpen } from './analytics';
import { getNewUniqueId, stripBom, formatXml } from './svg-utils';
import { saveSvgCode, loadSvgCode, pushCheckpoint, popCheckpoints, hasCheckpoints, migrateChatData } from './chat-storage';
import { getAuth } from 'firebase/auth';
import DEFAULT_SVG from '../assets/default.svg?raw';

/**
 * A clean, app-minted document id (getNewUniqueId = base36, lowercase [a-z0-9]).
 * Anything else — a legacy "_local_…" id or a filename used as an id by older
 * code — must not become a public id/URL (collisions across users).
 */
function isCleanId(id: string): boolean {
  return /^[a-z0-9]+$/.test(id);
}

export function useDocument(routeFileId: string | undefined) {
  const navigate = useNavigate();

  const [svgCode, setSvgCode] = useState('Loading please wait...');
  const [readOnly, setReadOnly] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  // A document gets its permanent id at creation and keeps it through save — the
  // chat, blobs, and (once saved) the files/{id} doc all share it. No "_local_"
  // prefix and no id swap on save.
  const [fileId, setFileId] = useState(() => routeFileId || localStorage.getItem('esvg-local-id') || (() => {
    const id = getNewUniqueId();
    localStorage.setItem('esvg-local-id', id);
    return id;
  })());
  const [canUndo, setCanUndo] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
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

  // Persist SVG to IndexedDB so it matches chat history on reload
  useEffect(() => {
    if (!readOnly) saveSvgCode(svgCode, fileId);
  }, [svgCode, readOnly, fileId]);

  // An uploaded file's download name only applies to that upload — clear it
  // whenever we navigate to a different document.
  useEffect(() => { setDownloadName(null); }, [routeFileId]);

  // DB init / load
  useEffect(() => {
    const db = new EditSvgCodeDb();
    dbRef.current = db;

    const handleDbInit = async () => {
      const uniqueId = routeFileId || '';
      if (uniqueId) setFileId(uniqueId);
      const currentFileId = uniqueId || localStorage.getItem('esvg-local-id') || fileId;

      if (uniqueId) {
        try {
          const result = await db.loadDocument(uniqueId);
          if (result) {
            setIsPrivate(result.private);
            const currentUid = getAuth().currentUser?.uid ?? null;
            setIsOwner(currentUid !== null && result.uid === currentUid);
            db.incrementViews(uniqueId).catch((err) => logError('incrementViews', err));
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
        } catch {
          setSvgCode(DEFAULT_SVG);
          notifications.show({ title: 'Access denied', message: 'This file is private or does not exist.', color: 'red' });
        }
        setReadOnly(false);
      } else {
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
    // Anonymous users always save as public
    const effectivePrivate = getAuth().currentUser?.isAnonymous ? false : isPrivate;
    db.saveDocument(uniqueId, svgCode, effectivePrivate)
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
  }, [svgCode, routeFileId, navigate, isPrivate, fileId]);

  const handleTogglePrivate = useCallback(async () => {
    const db = dbRef.current;
    if (!db || !routeFileId) return;
    // Anonymous users and non-owners cannot change privacy
    if (getAuth().currentUser?.isAnonymous) return;
    if (!isOwner) return;
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
  }, [fileId, clearProposal]);

  return {
    svgCode, setSvgCode,
    readOnly,
    saving,
    isPrivate,
    isAnonymous,
    isOwner,
    fileId,
    canUndo,
    proposedSvg,
    handleDiffMount,
    handleSave,
    handleTogglePrivate,
    handleFileChange,
    handleDownload,
    handleNew,
    handlePreviewSvg,
    handleAcceptSvg,
    handleUndo,
  };
}

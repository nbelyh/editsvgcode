import { useState, useCallback, useRef, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import type { DiffOnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { EditSvgCodeDb, friendlyError } from './firebase';
import { getNewUniqueId, stripBom, formatXml } from './svg-utils';
import { saveSvgCode, loadSvgCode, pushCheckpoint, popCheckpoints, hasCheckpoints } from './chat-storage';
import { getAuth } from 'firebase/auth';
import DEFAULT_SVG from '../assets/default.svg?raw';

export function useDocument(routeFileId: string | undefined) {
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
  const [canUndo, setCanUndo] = useState(false);
  const [proposedSvg, setProposedSvg] = useState<string | null>(null);
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

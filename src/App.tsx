import { useState, useCallback, useRef, useEffect } from 'react';
import { AppShell, Group, Button, Text, Tooltip } from '@mantine/core';
import { IconFolderOpen, IconDownload, IconCloudUpload, IconBrandGithub, IconBug } from '@tabler/icons-react';
import { Allotment } from 'allotment';
import { Editor, type EditorHandle } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { EditSvgCodeDb } from './lib/firebase';
import { getUniqueId, getNewUniqueId, stripBom, findElementRange } from './lib/svg-utils';
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

    const handleDbInit = () => {
      const uniqueId = getUniqueId();
      if (uniqueId) {
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
      return;
    }
    const range = findElementRange(svgCode, tagName, index);
    if (!range) return;
    editorRef.current?.selectRange(range.startLine, range.startCol, range.endLine, range.endCol);
  }, [svgCode]);

  return (
    <AppShell
      header={{ height: 56 }}
      footer={{ height: 40 }}
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

      <AppShell.Main style={{ backgroundColor: '#1e1e1e' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/svg+xml"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <Allotment>
          <Allotment.Pane preferredSize="45%">
            <Editor ref={editorRef} value={svgCode} onChange={setSvgCode} readOnly={readOnly} />
          </Allotment.Pane>
          <Allotment.Pane preferredSize="45%">
            <Preview svgCode={svgCode} onElementSelect={handleElementSelect} />
          </Allotment.Pane>
          <Allotment.Pane preferredSize="10%" minSize={150}>
            <Sidebar onOpenCommandPalette={() => editorRef.current?.openCommandPalette()} />
          </Allotment.Pane>
        </Allotment>
      </AppShell.Main>

      <AppShell.Footer
        style={{ backgroundColor: 'var(--mantine-color-dark-7)', borderTop: '1px solid var(--mantine-color-dark-4)' }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Text size="sm" c="dimmed">
            Built by Nikolay Belykh @{' '}
            <Text component="a" href="https://unmanagedvisio.com" target="_blank" size="sm" c="dimmed" td="underline">
              Unmanaged Visio
            </Text>
            {' '}
            <Text component="a" href="/privacy-policy.md" target="_blank" size="sm" c="dimmed" td="underline">
              privacy policy
            </Text>
          </Text>
          <Group gap="md">
            <Text
              component="a"
              href="https://github.com/nbelyh/editsvgcode/issues"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              c="dimmed"
              td="underline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <IconBug size={16} /> Report Issue
            </Text>
            <Text
              component="a"
              href="https://github.com/nbelyh/editsvgcode"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              c="dimmed"
              td="underline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <IconBrandGithub size={16} /> GitHub
            </Text>
          </Group>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}

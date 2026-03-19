import { useState, useCallback, useRef, useEffect } from 'react';
import { AppShell, Group, Button, Text, Tooltip } from '@mantine/core';
import { IconFolderOpen, IconDownload, IconCloudUpload } from '@tabler/icons-react';
import { Allotment } from 'allotment';
import { Editor, type EditorHandle } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { EditSvgCodeDb } from './lib/firebase';
import './App.css';

const DEFAULT_SVG = `<!-- sample rectangle -->
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" x="50" y="50" fill="red" />
</svg>`;

function getUniqueId(): string {
  return document.location.pathname.split('/')[1] || '';
}

function getNewUniqueId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default function App() {
  const [svgCode, setSvgCode] = useState('Loading please wait...');
  const [readOnly, setReadOnly] = useState(true);
  const [saving, setSaving] = useState(false);
  const dbRef = useRef<EditSvgCodeDb | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<EditorHandle>(null);

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
      let text = ev.target?.result as string;
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
      setSvgCode(text);
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
    // Find the Nth opening tag
    const openRegex = new RegExp(`<${tagName}[\\s>/]`, 'gi');
    let match: RegExpExecArray | null;
    let count = 0;
    let startOffset = -1;
    while ((match = openRegex.exec(svgCode)) !== null) {
      if (count === index) { startOffset = match.index; break; }
      count++;
    }
    if (startOffset < 0) return;

    // Find the end: self-closing "/>" or closing "</tagName>"
    let endOffset = startOffset;
    const selfClose = svgCode.indexOf('/>', startOffset);
    const closeTag = svgCode.indexOf(`</${tagName}>`, startOffset);
    const openEnd = svgCode.indexOf('>', startOffset);
    if (selfClose >= 0 && selfClose <= openEnd) {
      endOffset = selfClose + 2;
    } else if (closeTag >= 0) {
      endOffset = closeTag + tagName.length + 3; // </tagName>
    } else if (openEnd >= 0) {
      endOffset = openEnd + 1;
    }

    const before = svgCode.substring(0, startOffset);
    const startLine = before.split('\n').length;
    const startCol = startOffset - before.lastIndexOf('\n');
    const upToEnd = svgCode.substring(0, endOffset);
    const endLine = upToEnd.split('\n').length;
    const endCol = endOffset - upToEnd.lastIndexOf('\n');

    editorRef.current?.selectRange(startLine, startCol, endLine, endCol);
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

      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/nbelyh/editsvgcode"
        style={{ position: 'absolute', right: 0, top: 0, zIndex: 10000 }}
      >
        <img
          width="149"
          height="149"
          src="https://github.blog/wp-content/uploads/2008/12/forkme_right_orange_ff7600.png?resize=149%2C149"
          alt="Fork me on GitHub"
        />
      </a>

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
            <Sidebar />
          </Allotment.Pane>
        </Allotment>
      </AppShell.Main>

      <AppShell.Footer
        style={{ backgroundColor: 'var(--mantine-color-dark-7)', borderTop: '1px solid var(--mantine-color-dark-4)' }}
      >
        <Group h="100%" px="md">
          <Text size="sm" c="dimmed">
            Built by Nikolay Belykh @{' '}
            <Text component="a" href="https://unmanagedvisio.com" target="_blank" size="sm" c="dimmed" td="underline">
              Unmanaged Visio
            </Text>
            {' '}check out the website privacy policy{' '}
            <Text component="a" href="/privacy-policy.md" target="_blank" size="sm" c="dimmed" td="underline">
              here
            </Text>
          </Text>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}

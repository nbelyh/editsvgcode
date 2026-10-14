import { StrictMode, useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { ActionIcon, Button, Center, Group, Loader, MantineProvider, ScrollArea, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { IconArrowLeft, IconExternalLink, IconFileUpload, IconMaximize, IconMinimize, IconRefresh } from '@tabler/icons-react';
import { App } from '@modelcontextprotocol/ext-apps';
import '@mantine/core/styles.css';
import './widget.css';
import { Preview } from '../components/Preview';
import { tellModel, textOf } from './bridge';
import { theme } from '../theme';

/**
 * The MCP widget: the drawing a chat host's model works on, shown in the host's iframe with the
 * editor's own Preview. The show_document tool (functions/src/tools.ts) carries this page. Its
 * result names the document; the page then fetches the markup through get_document_svg, a tool
 * only the app may call, so the SVG does not pass through the model's context again.
 * list_documents and upload_document carry it as a picker: the user's drawings to click, and a
 * box to drop an SVG file into. A dropped file is saved with create_document from here, so the
 * model never has to copy it; either way the model is told which document the user chose. In
 * claude.ai the model finds tools by search and reaches for list_documents when it looks for
 * files, so the picker turns up where upload_document alone was never called.
 * functions/scripts/build.mjs bundles this file into the one HTML page the server hands out.
 */

/** What a show_document or create_document result names. */
interface Shown {
  documentId: string;
}

/** One of the user's drawings, as list_documents and upload_document return them for the picker. */
interface Listed {
  id: string;
  title: string;
  modified: string | null;
}

/** As the server's MAX_SVG_BYTES (functions/src/edits.ts). */
const MAX_SVG_BYTES = 900_000;

/** What get_document_svg returns. */
interface Loaded {
  svg: string;
  title: string;
  link: string;
}

const app = new App(
  { name: 'EditSvgCode preview', version: '1.0.0' },
  { availableDisplayModes: ['inline', 'fullscreen'] },
);

// Outside React, and before connect(): the host sends the tool result once, right after the
// handshake, and a listener registered later would miss it.
let shown: Shown | null = null;
/** The picker's drawings, while this widget came from list_documents or upload_document. */
let listed: Listed[] | null = null;
let picking = false;
/** The user just chose here, and still has to tell the model what to do with it. */
let chose: 'uploaded' | 'picked' | null = null;
let failure: string | null = null;
let version = 0;
const listeners = new Set<() => void>();

function changed(): void {
  version++;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

app.addEventListener('toolresult', (result) => {
  const content = result.structuredContent as (Partial<Shown> & { documents?: Listed[] }) | undefined;
  const id = content?.documentId;
  if (!result.isError && Array.isArray(content?.documents)) {
    failure = null;
    shown = null;
    listed = content.documents;
    picking = true;
  } else if (result.isError || typeof id !== 'string') {
    failure = textOf(result) || 'There is no drawing to show.';
    shown = null;
    picking = false;
  } else {
    failure = null;
    shown = { documentId: id };
    picking = false;
  }
  changed();
});
// Read through getHostContext(): the notification carries only the fields that changed.
app.addEventListener('hostcontextchanged', changed);
app.connect().then(changed, () => {
  failure = 'Could not connect to the chat.';
  changed();
});

/** Show the chosen drawing and tell the model which it is. */
async function choose(id: string, how: 'uploaded' | 'picked', note: string): Promise<void> {
  shown = { documentId: id };
  picking = false;
  chose = how;
  changed();
  await tellModel(app, note);
}

/** Save a dropped file as a new document, then choose it. Returns an error to show, or null. */
async function uploadFile(file: File): Promise<string | null> {
  const svg = await file.text();
  if (!/<svg[\s>]/i.test(svg)) return 'That is not an SVG file.';
  if (new TextEncoder().encode(svg).length > MAX_SVG_BYTES) return 'The file is over the 900 KB limit.';
  const title = file.name.replace(/\.svg$/i, '');
  const result = await app.callServerTool({ name: 'create_document', arguments: { svg, title } });
  const id = (result.structuredContent as Partial<Shown> | undefined)?.documentId;
  if (result.isError || typeof id !== 'string') return textOf(result) || 'The file could not be saved.';

  // For the model, not for reading: it names the document by id.
  await choose(id, 'uploaded', `The user uploaded "${file.name}" in the box; it is saved as document ${id}. open_document it before editing.`);
  return null;
}

/** Drop an SVG file, or pick one from the computer. */
function DropBox() {
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const take = async (file: File | undefined) => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      setError(await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Center
      p="xs"
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); void take(e.dataTransfer.files[0]); }}
    >
      <Stack
        align="center" gap={6} p="md"
        style={{
          width: '100%', justifyContent: 'center', borderRadius: 8,
          border: `2px dashed ${over ? 'var(--mantine-color-blue-filled)' : 'var(--esvg-chrome-border)'}`,
          background: over ? 'var(--mantine-color-blue-light)' : undefined,
        }}
      >
        <IconFileUpload size={28} stroke={1.5} />
        <Text fw={500}>Drop an SVG file here</Text>
        <Button component="label" variant="light" size="xs" loading={busy}>
          Choose a file
          <input type="file" accept=".svg,image/svg+xml" hidden onChange={(e) => void take(e.target.files?.[0])} />
        </Button>
        <Text size="xs" c="dimmed">It is saved to your EditSvgCode account, private.</Text>
        {error && <Text size="sm" c="red">{error}</Text>}
      </Stack>
    </Center>
  );
}

/** The picker: a new file into the box above, or one of the user's drawings below. */
function Picker({ documents }: { documents: Listed[] }) {
  return (
    <ScrollArea h="100%">
      <DropBox />
      {documents.length > 0 && (
        <Stack gap={0} px="xs" pb="xs">
          <Text size="xs" c="dimmed" px={6} py={4}>Or pick one of your drawings</Text>
          {documents.map((d) => (
            <UnstyledButton
              key={d.id}
              className="esvg-picker-row"
              onClick={() => void choose(d.id, 'picked', `The user picked document ${d.id} in the box. open_document it before editing.`)}
            >
              <Group justify="space-between" wrap="nowrap" gap="xs">
                <Text size="sm" truncate="end">{d.title || 'Untitled drawing'}</Text>
                {d.modified && <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>{new Date(d.modified).toLocaleString()}</Text>}
              </Group>
            </UnstyledButton>
          ))}
        </Stack>
      )}
    </ScrollArea>
  );
}

/** Inline, the frame is as tall as three quarters of its width, within bounds; fullscreen, all of it. */
function useFrameHeight(fullscreen: boolean): string {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return fullscreen ? '100vh' : `${Math.min(560, Math.max(280, Math.round(width * 0.75)))}px`;
}

function Widget() {
  useSyncExternalStore(subscribe, () => version);
  const context = app.getHostContext();
  const fullscreen = context?.displayMode === 'fullscreen';
  const canFullscreen = context?.availableDisplayModes?.includes('fullscreen') ?? false;
  const height = useFrameHeight(fullscreen);
  const documentId = shown?.documentId ?? null;

  const [doc, setDoc] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const result = await app.callServerTool({ name: 'get_document_svg', arguments: { document_id: id } });
      const loaded = result.structuredContent as Partial<Loaded> | undefined;
      if (result.isError || typeof loaded?.svg !== 'string') {
        setError(textOf(result) || 'The drawing could not be loaded.');
      } else {
        setError(null);
        setDoc({ svg: loaded.svg, title: loaded.title ?? '', link: loaded.link ?? '' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (documentId) void load(documentId);
  }, [documentId, load]);

  const toggleFullscreen = async () => {
    try {
      await app.requestDisplayMode({ mode: fullscreen ? 'inline' : 'fullscreen' });
    } catch {
      // The host keeps the mode it has.
    }
    changed();
  };

  const message = failure ?? error;

  return (
    <MantineProvider theme={theme} forceColorScheme={context?.theme}>
      <div style={{ height, display: 'flex', flexDirection: 'column' }}>
        <Group
          justify="space-between" wrap="nowrap" px="xs" py={4} gap="xs"
          style={{ backgroundColor: 'var(--esvg-chrome-bg)', borderBottom: '1px solid var(--esvg-chrome-border)', flexShrink: 0, minHeight: 36 }}
        >
          <Group gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
            {listed && !picking && (
              <Tooltip label="Back to your drawings">
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => { picking = true; chose = null; changed(); }} aria-label="Back to your drawings">
                  <IconArrowLeft size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            <Text size="sm" fw={500} truncate="end">{picking ? 'Choose a drawing' : doc?.title || 'Untitled drawing'}</Text>
          </Group>
          <Group gap={4} wrap="nowrap">
            {documentId && !picking && (
              <Tooltip label="Show the latest version">
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => void load(documentId)} loading={loading} aria-label="Refresh">
                  <IconRefresh size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {doc?.link && !picking && (
              <Tooltip label="Open in EditSvgCode">
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => void app.openLink({ url: doc.link }).catch(() => undefined)} aria-label="Open in EditSvgCode">
                  <IconExternalLink size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {canFullscreen && (
              <Tooltip label={fullscreen ? 'Exit full screen' : 'Full screen'}>
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => void toggleFullscreen()} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}>
                  {fullscreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
        {chose && !picking && (
          <Text size="xs" px="xs" py={4} c="dimmed" style={{ borderBottom: '1px solid var(--esvg-chrome-border)', flexShrink: 0 }}>
            {chose === 'uploaded'
              ? 'Saved to your EditSvgCode account. Now say in the chat what to change.'
              : 'Now say in the chat what to change.'}
          </Text>
        )}
        <div style={{ flex: 1, minHeight: 0 }}>
          {picking && listed && !failure ? (
            <Picker documents={listed} />
          ) : doc && !message ? (
            <Preview svgCode={doc.svg} />
          ) : (
            <Center h="100%" p="md">
              {message ? <Text size="sm" c="dimmed" ta="center">{message}</Text> : <Loader size="sm" />}
            </Center>
          )}
        </div>
      </div>
    </MantineProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Widget />
  </StrictMode>,
);

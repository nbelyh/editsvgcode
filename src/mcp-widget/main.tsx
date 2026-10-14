import { StrictMode, useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { ActionIcon, Center, Group, Loader, MantineProvider, Text, Tooltip } from '@mantine/core';
import { IconExternalLink, IconMaximize, IconMinimize, IconRefresh } from '@tabler/icons-react';
import { App } from '@modelcontextprotocol/ext-apps';
import '@mantine/core/styles.css';
import './widget.css';
import { Preview } from '../components/Preview';
import { theme } from '../theme';

/**
 * The MCP widget: the drawing a chat host's model works on, shown in the host's iframe with the
 * editor's own Preview. The show_document tool (functions/src/tools.ts) carries this page. Its
 * result names the document; the page then fetches the markup through get_document_svg, a tool
 * only the app may call, so the SVG does not pass through the model's context again.
 * functions/scripts/build.mjs bundles this file into the one HTML page the server hands out.
 */

/** What a show_document result names. */
interface Shown {
  documentId: string;
}

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

function textOf(result: { content?: Array<{ type: string; text?: string }> }): string {
  return (result.content ?? []).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('\n');
}

app.addEventListener('toolresult', (result) => {
  const id = (result.structuredContent as Partial<Shown> | undefined)?.documentId;
  if (result.isError || typeof id !== 'string') {
    failure = textOf(result) || 'There is no drawing to show.';
    shown = null;
  } else {
    failure = null;
    shown = { documentId: id };
  }
  changed();
});
// Read through getHostContext(): the notification carries only the fields that changed.
app.addEventListener('hostcontextchanged', changed);
app.connect().then(changed, () => {
  failure = 'Could not connect to the chat.';
  changed();
});

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
          <Text size="sm" fw={500} truncate="end">{doc?.title || 'Untitled drawing'}</Text>
          <Group gap={4} wrap="nowrap">
            {documentId && (
              <Tooltip label="Show the latest version">
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => void load(documentId)} loading={loading} aria-label="Refresh">
                  <IconRefresh size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {doc?.link && (
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
        <div style={{ flex: 1, minHeight: 0 }}>
          {doc && !message ? (
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

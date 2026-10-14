import { StrictMode, useEffect, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { ActionIcon, Button, Center, Group, Loader, MantineProvider, Stack, Text, Textarea, Tooltip } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { App } from '@modelcontextprotocol/ext-apps';
import '@mantine/core/styles.css';
import './widget.css';
import { Preview } from '../components/Preview';
import { ImageGenerationControls } from '../components/TraceControls';
import { PictureStyleOptions } from '../components/aichat/PictureStyleOptions';
import { traceToFit, type VectorizerParams } from '../lib/trace';
import type { ImageStyle } from '../lib/models';
import { theme } from '../theme';
import { tellModel, textOf } from './bridge';

/**
 * The picture widget: what generate_image (functions/src/tools.ts) shows in the chat. As in the
 * editor's chat, a card asks first — the prompt, how the picture is drawn, what it costs — and
 * nothing is made or charged until the user presses Generate. The picture then comes straight
 * from the MCP function through a one-time link (functions/src/pictures.ts), not through the
 * chat; it is traced into SVG here, in the browser, with the editor's vtracer, saved as a new
 * drawing, and shown with the tracer's settings, which retrace it and save again.
 * functions/scripts/build.mjs bundles this file into the page the server hands out.
 */

/** What a generate_image result carries. */
interface Asked {
  prompt: string;
  model: string;
  credits: number;
  editorUrl: string;
}

const app = new App(
  { name: 'EditSvgCode picture', version: '1.0.0' },
  { availableDisplayModes: ['inline'] },
);

// Outside React, and before connect(): the host sends the tool result once, right after the
// handshake, and a listener registered later would miss it.
let asked: Asked | null = null;
let failure: string | null = null;
let version = 0;
const listeners = new Set<() => void>();

function changed(): void {
  version++;
  listeners.forEach((l) => l());
}

app.addEventListener('toolresult', (result) => {
  const content = result.structuredContent as Partial<Asked> | undefined;
  if (result.isError || typeof content?.prompt !== 'string') {
    failure = textOf(result) || 'There is no picture to make.';
  } else {
    asked = { prompt: content.prompt, model: content.model ?? '', credits: content.credits ?? 0, editorUrl: content.editorUrl ?? '' };
  }
  changed();
});
app.addEventListener('hostcontextchanged', changed);
app.connect().then(changed, () => {
  failure = 'Could not connect to the chat.';
  changed();
});

type Stage =
  | { kind: 'card' }
  | { kind: 'working'; step: 'generating' | 'tracing' }
  | { kind: 'failed'; message: string; credits: boolean }
  | { kind: 'done'; png: string; svg: string; params: VectorizerParams; documentId: string };

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('The picture could not be read.'));
    reader.readAsDataURL(blob);
  });
}

function Card({ ask, onGenerate }: { ask: Asked; onGenerate: (prompt: string, style: ImageStyle) => void }) {
  const [prompt, setPrompt] = useState(ask.prompt);
  const [style, setStyle] = useState<ImageStyle>({ outlines: true, detail: false });
  return (
    <Stack gap="xs" p="sm">
      <Text fw={500}>Generate this picture?</Text>
      <Textarea value={prompt} onChange={(e) => setPrompt(e.currentTarget.value)} autosize minRows={2} maxRows={6} />
      <Text size="xs" c="dimmed">A generated picture is traced into SVG shapes, so you can edit it like any other drawing.</Text>
      <PictureStyleOptions value={style} onChange={setStyle} />
      <Group>
        <Button size="xs" disabled={!prompt.trim()} onClick={() => onGenerate(prompt.trim(), style)}>
          {`Generate picture (${ask.credits} credits)`}
        </Button>
      </Group>
    </Stack>
  );
}

function Widget() {
  useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => version);
  const context = app.getHostContext();
  const [stage, setStage] = useState<Stage>({ kind: 'card' });
  const [title, setTitle] = useState('');
  /** The tracer's sliders are open until the user is done with them. */
  const [tuning, setTuning] = useState(true);

  useEffect(() => {
    if (asked) setTitle(asked.prompt.slice(0, 80));
  }, [version]);

  const generate = async (ask: Asked, prompt: string, style: ImageStyle) => {
    setTitle(prompt.slice(0, 80));
    setStage({ kind: 'working', step: 'generating' });
    try {
      const link = await app.callServerTool({
        name: 'picture_link',
        arguments: { prompt, model: ask.model, outlines: style.outlines, detail: style.detail },
      });
      const url = (link.structuredContent as { url?: string } | undefined)?.url;
      if (link.isError || !url) throw new Error(textOf(link) || 'The picture could not be started.');

      const res = await fetch(url);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setStage({ kind: 'failed', message: data.error ?? `The picture could not be made (${res.status}).`, credits: res.status === 402 });
        return;
      }
      const png = await readAsDataUrl(await res.blob());

      setStage({ kind: 'working', step: 'tracing' });
      const { svg, params } = await traceToFit(png);
      const saved = await app.callServerTool({ name: 'create_document', arguments: { svg, title: prompt.slice(0, 80) } });
      const documentId = (saved.structuredContent as { documentId?: string } | undefined)?.documentId;
      if (saved.isError || !documentId) throw new Error(textOf(saved) || 'The drawing could not be saved.');

      setStage({ kind: 'done', png, svg, params, documentId });
      // For the model, not for reading: it names the document by id.
      await tellModel(app, `The picture was generated, traced into SVG and saved as document ${documentId}. open_document it before editing.`);
    } catch (err) {
      setStage({ kind: 'failed', message: err instanceof Error ? err.message : String(err), credits: false });
    }
  };

  // A retrace replaces the saved drawing, so what the chat goes on with is what is on show.
  const retraced = async (svg: string) => {
    if (stage.kind !== 'done') return;
    setStage({ ...stage, svg });
    await app.callServerTool({ name: 'replace_svg', arguments: { document_id: stage.documentId, svg } }).catch(() => undefined);
  };

  const ask = asked;
  const link = stage.kind === 'done' && ask?.editorUrl ? `${ask.editorUrl}/${stage.documentId}` : null;

  return (
    <MantineProvider theme={theme} forceColorScheme={context?.theme}>
      <Group
        justify="space-between" wrap="nowrap" px="xs" py={4} gap="xs"
        style={{ backgroundColor: 'var(--esvg-chrome-bg)', borderBottom: '1px solid var(--esvg-chrome-border)', minHeight: 36 }}
      >
        <Text size="sm" fw={500} truncate="end">{title || 'Picture'}</Text>
        {link && (
          <Tooltip label="Open in EditSvgCode">
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => void app.openLink({ url: link }).catch(() => undefined)} aria-label="Open in EditSvgCode">
              <IconExternalLink size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      {failure ? (
        <Center p="md"><Text size="sm" c="dimmed" ta="center">{failure}</Text></Center>
      ) : !ask ? (
        <Center p="md"><Loader size="sm" /></Center>
      ) : stage.kind === 'card' ? (
        <Card ask={ask} onGenerate={(prompt, style) => void generate(ask, prompt, style)} />
      ) : stage.kind === 'working' ? (
        <Center p="xl">
          <Stack align="center" gap="xs">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">
              {stage.step === 'generating' ? 'Generating the picture…' : 'Tracing it into SVG shapes…'}
            </Text>
          </Stack>
        </Center>
      ) : stage.kind === 'failed' ? (
        <Stack align="center" gap="xs" p="md">
          <Text size="sm" ta="center">{stage.message}</Text>
          <Group gap="xs">
            {stage.credits && ask.editorUrl && (
              <Button size="xs" variant="light" onClick={() => void app.openLink({ url: `${ask.editorUrl}/pricing` }).catch(() => undefined)}>
                See plans
              </Button>
            )}
            <Button size="xs" variant="subtle" onClick={() => setStage({ kind: 'card' })}>Back</Button>
          </Group>
        </Stack>
      ) : (
        <>
          <Text size="xs" px="xs" py={4} c="dimmed" style={{ borderBottom: '1px solid var(--esvg-chrome-border)' }}>
            Saved to your EditSvgCode account. Now say in the chat what to change.
          </Text>
          {/* The sliders beside the drawing, not under it at the chat's full width, where they
              stretched like an equalizer; in a narrow chat they wrap below it. */}
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 320px', height: 360, minWidth: 0 }}>
              <Preview svgCode={stage.svg} />
            </div>
            {/* Hidden, not unmounted, once Done: reopened, the sliders stand where they were left. */}
            <div style={{ flex: '0 1 340px', maxWidth: 340, padding: 8, borderLeft: '1px solid var(--esvg-chrome-border)', display: tuning ? undefined : 'none' }}>
              <ImageGenerationControls pngDataUrl={stage.png} initialParams={stage.params} onUpdateSvg={(svg) => void retraced(svg)} />
              <Group justify="flex-end" mt={6}>
                <Button size="xs" onClick={() => setTuning(false)}>Done</Button>
              </Group>
            </div>
          </div>
          {!tuning && (
            <Group px="xs" py={4} style={{ borderTop: '1px solid var(--esvg-chrome-border)' }}>
              <Button size="compact-xs" variant="subtle" color="gray" onClick={() => setTuning(true)}>Adjust the tracing</Button>
            </Group>
          )}
        </>
      )}
    </MantineProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Widget />
  </StrictMode>,
);

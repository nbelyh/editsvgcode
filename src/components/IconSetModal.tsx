import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Stack, Group, Text, Button, SegmentedControl, ColorInput, Code, ActionIcon, Tooltip, Loader } from '@mantine/core';
import { IconDownload, IconCopy, IconFileZip } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { CHECKERBOARD_LIGHT } from '../lib/checkerboard';
import { parseSvg, intrinsicSize, renderImage, isColour, loadsFromOtherSites, type Align } from '../lib/svg-export';
import { faviconIco, iconSetZip, appleTouchBackground, HEAD_SNIPPET, type IconOptions } from '../lib/icon-set';
import { trackExport } from '../lib/analytics';
import { PositionGrid } from './PositionGrid';

/**
 * Favicon and app icons: favicon.ico on its own, or every icon a site links to, zipped with the
 * lines for its <head>. The small sizes are previewed pixel for pixel, because a drawing that
 * reads well at 512 px can turn to mush at 16 — better seen here than in a browser tab.
 *
 * The iPhone icon is never transparent: iOS shows transparent parts of a home-screen icon as
 * black, so with Transparent chosen that one file gets white.
 */

type Background = 'transparent' | 'white' | 'custom';

interface Settings {
  align: Align;
  background: Background;
  customColor: string;
}

const STORAGE_KEY = 'esvg-icon-settings';
const DEFAULTS: Settings = { align: 'center', background: 'transparent', customColor: '#ffffff' };

function loadSettings(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') };
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch { /* private mode: the settings simply are not remembered */ }
}

/** The previews: the favicon sizes at their real pixels, and the home-screen icon at half size. */
const PREVIEWS: { size: number; shown: number; label: string; touch?: boolean }[] = [
  { size: 16, shown: 16, label: '16' },
  { size: 32, shown: 32, label: '32' },
  { size: 48, shown: 48, label: '48' },
  { size: 180, shown: 90, label: 'iPhone', touch: true },
];

function save(bytes: Uint8Array, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface IconSetModalProps {
  opened: boolean;
  onClose: () => void;
  svg: string;
  fileName: string;
}

export function IconSetModal({ opened, onClose, svg, fileName }: IconSetModalProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [busy, setBusy] = useState<'ico' | 'zip' | null>(null);
  const update = (patch: Partial<Settings>) => setSettings((s) => {
    const next = { ...s, ...patch };
    saveSettings(next);
    return next;
  });

  const own = useMemo(() => {
    if (!opened) return null;
    const parsed = parseSvg(svg);
    return 'error' in parsed ? parsed : intrinsicSize(parsed.root);
  }, [opened, svg]);
  const error = own && 'error' in own ? own.error : null;
  // A square drawing fills the square whatever the position, so the grid would do nothing.
  const square = !own || 'error' in own || Math.abs(own.width / own.height - 1) < 0.01;

  // A colour half typed into the picker is not one yet: nothing is drawn or saved with it.
  const colourInvalid = settings.background === 'custom' && !isColour(settings.customColor);
  const background = settings.background === 'transparent' ? null
    : settings.background === 'white' ? '#ffffff' : settings.customColor;
  const options: IconOptions = { align: settings.align, background };

  const [previews, setPreviews] = useState<string[] | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewsRef = useRef<string[]>([]);
  const showPreviews = (urls: string[] | null) => {
    previewsRef.current.forEach((u) => URL.revokeObjectURL(u));
    previewsRef.current = urls ?? [];
    setPreviews(urls);
  };
  useEffect(() => {
    if (!opened || error) {
      showPreviews(null);
      return;
    }
    if (colourInvalid) return; // the last good previews stay while the colour is being typed
    let cancelled = false;
    const timer = setTimeout(async () => {
      const results = await Promise.all(PREVIEWS.map((p) => renderImage(svg, {
        size: { width: p.size, height: p.size },
        format: 'png',
        background: p.touch ? appleTouchBackground(background) : background,
        align: settings.align,
      })));
      if (cancelled) return;
      // Previews that cannot be drawn say why, rather than leaving a spinner turning for ever.
      const failed = results.find((r) => 'error' in r);
      setPreviewError(failed && 'error' in failed ? failed.error : null);
      showPreviews(failed ? null : results.map((r) => URL.createObjectURL((r as { blob: Blob }).blob)));
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // showPreviews only touches a ref and a setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, svg, error, background, colourInvalid, settings.align]);

  const run = async (kind: 'ico' | 'zip') => {
    setBusy(kind);
    try {
      const bytes = kind === 'ico' ? await faviconIco(svg, options) : await iconSetZip(svg, options);
      if ('error' in bytes) {
        notifications.show({ title: 'Could not make the icons', message: bytes.error, color: 'red' });
        return;
      }
      trackExport({ format: kind, size: 'icons', background: settings.background, action: 'download' });
      if (kind === 'ico') save(bytes, 'favicon.ico', 'image/x-icon');
      else save(bytes, `${fileName}-icons.zip`, 'application/zip');
      onClose();
    } finally {
      setBusy(null);
    }
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(HEAD_SNIPPET);
      notifications.show({ title: 'HTML copied', message: 'Paste it into the <head> of your page.', color: 'blue' });
    } catch {
      notifications.show({ title: 'Could not copy', message: 'This browser did not allow access to the clipboard.', color: 'red' });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Favicon and app icons" centered size="md">
      <Stack gap="md">
        {!error && (
          <Group
            justify="center"
            align="flex-end"
            gap="lg"
            style={{ padding: 12, backgroundImage: CHECKERBOARD_LIGHT, borderRadius: 4, border: '1px solid var(--mantine-color-default-border)', minHeight: 132 }}
          >
            {previews ? PREVIEWS.map((p, i) => (
              <Stack key={p.size} gap={4} align="center">
                <img
                  data-testid={`icon-preview-${p.size}`}
                  src={previews[i]}
                  alt=""
                  width={p.shown}
                  height={p.shown}
                  // At its own size and smoothly scaled, as a browser tab shows it. Hard-edged pixels
                  // looked truthful but made a smooth 16 px icon look blocky on a sharp screen, which
                  // no tab ever shows. The outline marks the square, so the empty part of it shows.
                  style={{
                    borderRadius: p.touch ? 20 : 0, display: 'block',
                    outline: p.touch ? undefined : '1px dashed var(--mantine-color-gray-5)',
                  }}
                />
                <Text size="xs" c="dark.3">{p.label}</Text>
              </Stack>
            )) : previewError ? <Text size="sm" c="red">{previewError}</Text> : <Loader size="sm" />}
          </Group>
        )}

        {!square && (
          <Group gap="sm" align="center" wrap="nowrap">
            <PositionGrid value={settings.align} onChange={(align) => update({ align })} />
            <Text size="xs" c="dimmed">
              Icons are square. Position of the drawing in the square: it stays whole and keeps its proportions.
            </Text>
          </Group>
        )}

        <div>
          <Text size="sm" fw={500} mb={4}>Background</Text>
          <SegmentedControl
            fullWidth
            value={settings.background}
            onChange={(v) => update({ background: v as Background })}
            data={[
              { value: 'transparent', label: 'Transparent' },
              { value: 'white', label: 'White' },
              { value: 'custom', label: 'Colour' },
            ]}
          />
          {settings.background === 'custom' && (
            <ColorInput
              mt="xs"
              label="Background colour"
              value={settings.customColor}
              error={colourInvalid ? 'Not a colour yet' : undefined}
              onChange={(v) => update({ customColor: v })}
            />
          )}
          {settings.background === 'transparent' && (
            <Text size="xs" c="dimmed" mt={4}>
              The iPhone icon gets a white background, because iOS shows a transparent one on black.
            </Text>
          )}
        </div>

        <div>
          <Group justify="space-between" gap="xs" mb={4} wrap="nowrap">
            <Text size="sm" fw={500}>Put the files at the root of your site, and these lines in its &lt;head&gt;</Text>
            <Tooltip label="Copy">
              <ActionIcon variant="default" aria-label="Copy the HTML" onClick={copySnippet}>
                <IconCopy size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Code block data-testid="icon-head-snippet" style={{ fontSize: 11, whiteSpace: 'pre', overflowX: 'auto' }}>{HEAD_SNIPPET}</Code>
          <Text size="xs" c="dimmed" mt={4}>
            The zip has every file these lines name: favicon.ico (16, 32 and 48 px), icon.svg, apple-touch-icon.png (180 px), icon-192.png, icon-512.png and site.webmanifest.
          </Text>
        </div>

        {loadsFromOtherSites(svg) && (
          <Text size="xs" c="orange">
            This drawing loads images or fonts from other websites. Browsers leave those out when they draw an SVG as a picture, so put them inside the SVG to be sure they appear.
          </Text>
        )}
        {error && <Text size="sm" c="red">{error}</Text>}

        <Group justify="flex-end" gap="xs">
          <Button variant="default" leftSection={<IconDownload size={14} />} disabled={!!error || colourInvalid} loading={busy === 'ico'} onClick={() => run('ico')}>
            favicon.ico
          </Button>
          <Button leftSection={<IconFileZip size={14} />} disabled={!!error || colourInvalid} loading={busy === 'zip'} onClick={() => run('zip')}>
            Download all (.zip)
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

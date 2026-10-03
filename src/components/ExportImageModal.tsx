import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Stack, Group, Text, Button, SegmentedControl, NumberInput, ColorInput, Loader, ActionIcon, Tooltip, SimpleGrid } from '@mantine/core';
import { CHECKERBOARD_LIGHT } from '../lib/checkerboard';
import { PositionGrid } from './PositionGrid';
import { IconDownload, IconCopy, IconLink, IconLinkOff } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
  parseSvg, intrinsicSize, outputSize, renderImage, canEncode, isColour, loadsFromOtherSites, scaledName, srcsetImg, MAX_SIDE,
  type ImageFormat, type SizeChoice, type Align,
} from '../lib/svg-export';
import { zipFile } from '../lib/icon-set';
import { trackExport } from '../lib/analytics';

/**
 * Export the drawing as a picture: PNG or WebP, at a scale or a custom size, on a transparent or
 * a solid background. The same settings the comparable tools offer — Figma's scale presets,
 * Inkscape's width, height and background — and no JPEG, which cannot be transparent and gives
 * nothing PNG does not.
 *
 * 1× is the drawing's own size, so what comes out matches what the SVG says it is; the pixel
 * size is shown before anything is saved, because 1× of a 24 px icon is a 24 px picture. 2× and
 * 3× are the same picture for sharp screens — phones, Retina laptops — and are wanted together:
 * an app or a page ships logo.png, logo@2x.png and logo@3x.png side by side. So the scales can
 * be picked together, as Figma's export rows and Illustrator's scale ticks can, and several come
 * as one zip with the <img srcset> line that uses them. The last settings are remembered.
 *
 * A custom size keeps the drawing's proportions until the lock is opened. A box of another shape
 * — a square app icon from a wide logo — then needs to say where the drawing sits in it. The
 * drawing stays whole and undistorted, with margins where the shapes differ: that is SVG's own
 * preserveAspectRatio, so the picture is what a browser would show for the drawing in that box.
 */

type SizeMode = 'scale' | 'custom';

/** The densities apps and pages ship: ordinary screens, then sharp laptops and most phones. */
const SCALES = [1, 2, 3];
type Background = 'transparent' | 'white' | 'custom';

interface Settings {
  format: ImageFormat;
  sizeMode: SizeMode;
  /** The scales picked, when sizeMode is 'scale' — at least one, in order. */
  scales: number[];
  customWidth: number;
  customHeight: number;
  keepRatio: boolean;
  align: Align;
  background: Background;
  customColor: string;
}

/** The preview's box. The picture is fitted inside it, whatever size is being exported. */
const PREVIEW_W = 400;
const PREVIEW_H = 180;

const STORAGE_KEY = 'esvg-export-settings';
const DEFAULTS: Settings = {
  format: 'png', sizeMode: 'scale', scales: [1], customWidth: 1024, customHeight: 1024, keepRatio: true,
  align: 'center', background: 'transparent', customColor: '#ffffff',
};

function loadSettings(): Settings {
  try {
    const saved = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') };
    // Anything not understood — a scale no longer offered, a size mode from before — starts at 1×.
    const scales = Array.isArray(saved.scales) ? SCALES.filter((s) => saved.scales.includes(s)) : [];
    return {
      ...saved,
      sizeMode: saved.sizeMode === 'custom' ? 'custom' : 'scale',
      scales: scales.length ? scales : [1],
    };
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch { /* private mode: the settings simply are not remembered */ }
}

/** A custom size names its pixels: name-1200x630.png. */
function customName(base: string, format: ImageFormat, size: { width: number; height: number }): string {
  return `${base}-${size.width}x${size.height}.${format}`;
}

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * A whole number of pixels. The field keeps what is typed — empty, mid-edit — and passes on only
 * real sizes, so clearing it to type a new number does not snap back to 1.
 */
function PixelInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const [text, setText] = useState<string | number>(value);
  useEffect(() => {
    setText((t) => (Number(t) === value ? t : value));
  }, [value]);
  return (
    <NumberInput
      label={label}
      min={1}
      max={MAX_SIDE}
      allowDecimal={false}
      allowNegative={false}
      value={text}
      onChange={(v) => {
        setText(v);
        const n = typeof v === 'number' ? v : parseInt(v, 10);
        if (n >= 1) onChange(Math.min(MAX_SIDE, n));
      }}
      onBlur={() => setText(value)}
      style={{ flex: 1 }}
    />
  );
}

interface ExportImageModalProps {
  opened: boolean;
  onClose: () => void;
  svg: string;
  fileName: string;
}

export function ExportImageModal({ opened, onClose, svg, fileName }: ExportImageModalProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [busy, setBusy] = useState<'download' | 'copy' | null>(null);
  const update = (patch: Partial<Settings>) => setSettings((s) => {
    const next = { ...s, ...patch };
    saveSettings(next);
    return next;
  });

  // WebP only where the browser can actually write it; a remembered WebP falls back to PNG there.
  const webp = canEncode('webp');
  const format: ImageFormat = settings.format === 'webp' && !webp ? 'png' : settings.format;

  // The drawing's own size, which 1× is and whose proportions the lock keeps.
  const own = useMemo(() => {
    if (!opened) return null;
    const parsed = parseSvg(svg);
    return 'error' in parsed ? parsed : intrinsicSize(parsed.root);
  }, [opened, svg]);
  const error = own && 'error' in own ? own.error : null;
  const ratio = own && !('error' in own) ? own.width / own.height : 1;

  const custom = settings.sizeMode === 'custom';
  const box = custom && !settings.keepRatio;
  // Locked, the height is never stored: it follows the width and whatever drawing is open.
  const lockedHeight = Math.max(1, Math.round(settings.customWidth / ratio));
  // One size per file that will be written: each scale picked, or the one custom size.
  const choices: SizeChoice[] = !custom ? settings.scales.map((scale) => ({ scale }))
    : [box ? { width: settings.customWidth, height: settings.customHeight } : { width: settings.customWidth }];
  const align: Align | undefined = box ? settings.align : undefined;
  const sizes = own && !('error' in own) ? choices.map((c) => outputSize(own, c)) : null;
  // The preview has one shape whatever the scale, so the first size stands for all of them.
  const size = sizes?.[0] ?? null;
  const several = choices.length > 1;

  /** A scale clicked: added to or taken from the set, which always keeps one. Custom is on its own. */
  const toggleScale = (scale: number) => {
    if (custom) return update({ sizeMode: 'scale', scales: [scale] });
    const picked = settings.scales.includes(scale) ? settings.scales.filter((s) => s !== scale) : [...settings.scales, scale];
    if (picked.length) update({ scales: SCALES.filter((s) => picked.includes(s)) });
  };

  // A colour half typed into the picker is not one yet: nothing is drawn or saved with it.
  const colourInvalid = settings.background === 'custom' && !isColour(settings.customColor);
  const background = settings.background === 'transparent' ? null
    : settings.background === 'white' ? '#ffffff' : settings.customColor;
  const scaleLabel = (scales: number[]) => scales.map((s) => `${s}x`).join('+');

  // What the picture will look like, drawn by the same renderer as the export — only smaller, in
  // a box of the export's shape — on a checkerboard so transparent parts show as transparent.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const showPreview = (url: string | null) => {
    // The old picture stays until its replacement is ready, so the preview never blinks empty.
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = url;
    setPreviewUrl(url);
  };
  const shapeKey = size ? `${size.width}x${size.height}` : '';
  useEffect(() => {
    if (!opened || !size) {
      showPreview(null);
      return;
    }
    if (colourInvalid) return; // the last good preview stays while the colour is being typed
    // At the screen's pixel density, so the preview is as sharp as the file will be.
    const scale = Math.min(PREVIEW_W / size.width, PREVIEW_H / size.height) * Math.min(2, window.devicePixelRatio || 1);
    const target = { width: Math.max(1, Math.round(size.width * scale)), height: Math.max(1, Math.round(size.height * scale)) };
    let cancelled = false;
    // A beat's delay, so typing a size or dragging through the colour picker draws once, not at every step.
    const timer = setTimeout(async () => {
      const result = await renderImage(svg, { size: target, format: 'png', background, align });
      if (cancelled) return;
      // A preview that cannot be drawn says why, rather than leaving a spinner turning for ever.
      setPreviewError('error' in result ? result.error : null);
      showPreview('error' in result ? null : URL.createObjectURL(result.blob));
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // The size is a new object each render; its key says when it changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, svg, background, colourInvalid, shapeKey, align]);

  const run = async (action: 'download' | 'copy') => {
    setBusy(action);
    try {
      // The clipboard takes PNG only, whatever format is chosen for saving — and one picture,
      // so with several scales picked it gets the largest.
      const output: ImageFormat = action === 'copy' ? 'png' : format;
      const wanted = action === 'copy' ? choices.slice(-1) : choices;
      const scales = action === 'copy' ? settings.scales.slice(-1) : settings.scales;
      const results = [];
      for (const wantedSize of wanted) {
        const rendered = await renderImage(svg, { size: wantedSize, format: output, background, align });
        if ('error' in rendered) {
          notifications.show({ title: 'Could not export the picture', message: rendered.error, color: 'red' });
          return;
        }
        results.push(rendered);
      }
      const result = results[results.length - 1];
      trackExport({ format: output, size: custom ? 'custom' : scaleLabel(scales), background: settings.background, action });
      if (action === 'download') {
        if (custom) {
          save(result.blob, customName(fileName, output, result));
        } else if (!several) {
          save(result.blob, scaledName(fileName, scales[0], output));
        } else {
          // Every density at once, with the line that lets the browser pick between them.
          const files = await Promise.all(results.map(async (r, i) => ({
            name: scaledName(fileName, scales[i], output),
            data: new Uint8Array(await r.blob.arrayBuffer()),
          })));
          const img = srcsetImg(fileName, output, scales, own && !('error' in own) ? own : result);
          files.push({ name: 'img.html', data: new TextEncoder().encode(`${img}\n`) });
          save(new Blob([zipFile(files) as BlobPart], { type: 'application/zip' }), `${fileName}-images.zip`);
        }
        onClose();
      } else {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': result.blob })]);
          notifications.show({ title: 'Picture copied', message: 'Paste it wherever you need it.', color: 'blue' });
          onClose();
        } catch {
          notifications.show({ title: 'Could not copy the picture', message: 'This browser did not allow copying a picture. Use Download instead.', color: 'red' });
        }
      }
    } finally {
      setBusy(null);
    }
  };

  const canCopy = typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write;

  return (
    <Modal opened={opened} onClose={onClose} title="Export image" centered size="md">
      <Stack gap="md">
        {!error && (
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', height: PREVIEW_H + 16, padding: 8,
              backgroundImage: CHECKERBOARD_LIGHT, borderRadius: 4, border: '1px solid var(--mantine-color-default-border)',
            }}
          >
            {previewUrl
              ? (
                <img
                  data-testid="export-preview"
                  src={previewUrl}
                  alt="Preview of the exported picture"
                  // The outline marks the picture's edges, so the margins of a fitted drawing show.
                  style={{ maxWidth: '100%', maxHeight: PREVIEW_H, display: 'block', outline: '1px dashed var(--mantine-color-gray-5)' }}
                />
              )
              : previewError ? <Text size="sm" c="red" ta="center">{previewError}</Text>
              : <Loader size="sm" />}
          </div>
        )}
        {webp && <div>
          <Text size="sm" fw={500} mb={4}>Format</Text>
          <SegmentedControl
            fullWidth
            value={format}
            onChange={(v) => update({ format: v as ImageFormat })}
            data={[{ value: 'png', label: 'PNG' }, { value: 'webp', label: 'WebP' }]}
          />
        </div>}

        <div>
          <Text size="sm" fw={500} mb={4}>Size</Text>
          <SimpleGrid cols={4} spacing={4}>
            {SCALES.map((scale) => {
              const on = !custom && settings.scales.includes(scale);
              return (
                <Button key={scale} variant={on ? 'filled' : 'default'} aria-pressed={on} onClick={() => toggleScale(scale)}>
                  {`${scale}×`}
                </Button>
              );
            })}
            <Button variant={custom ? 'filled' : 'default'} aria-pressed={custom} onClick={() => update({ sizeMode: 'custom' })}>
              Custom
            </Button>
          </SimpleGrid>
          {!custom && (
            <Text size="xs" c="dimmed" mt={4}>
              2× and 3× are for sharp screens, such as phones and Retina laptops. Pick several to get them all at once, zipped with the HTML that uses them.
            </Text>
          )}
          {custom && (
            <Group mt="xs" gap="xs" align="flex-end" wrap="nowrap">
              <PixelInput
                label="Width"
                value={Math.round(settings.customWidth)}
                onChange={(w) => update({ customWidth: w })}
              />
              <Tooltip label={settings.keepRatio ? 'Proportions kept: unlock to set any height' : 'Keep the drawing’s proportions'}>
                <ActionIcon
                  variant={settings.keepRatio ? 'light' : 'default'}
                  size={36}
                  aria-label="Keep proportions"
                  aria-pressed={settings.keepRatio}
                  onClick={() => update(settings.keepRatio
                    ? { keepRatio: false, customHeight: lockedHeight }
                    : { keepRatio: true })}
                >
                  {settings.keepRatio ? <IconLink size={16} /> : <IconLinkOff size={16} />}
                </ActionIcon>
              </Tooltip>
              <PixelInput
                label="Height"
                value={settings.keepRatio ? lockedHeight : settings.customHeight}
                onChange={(h) => update(settings.keepRatio
                  // Not rounded: the typed height must come back exactly, not one pixel off.
                  ? { customWidth: Math.max(1, Math.min(MAX_SIDE, h * ratio)) }
                  : { customHeight: h })}
              />
            </Group>
          )}
          {box && (
            <Group mt="sm" gap="sm" align="center" wrap="nowrap">
              <PositionGrid value={settings.align} onChange={(align) => update({ align })} />
              <Text size="xs" c="dimmed">
                Position of the drawing in the picture. It stays whole and keeps its proportions, with empty space where the shapes differ.
              </Text>
            </Group>
          )}
          {sizes && (
            <Text size="sm" c="dimmed" mt={6} data-testid="export-size">
              {sizes.map((s) => `${s.width} × ${s.height}`).join(', ')} px
            </Text>
          )}
          {sizes?.some((s) => s.reduced) && (
            <Text size="xs" c="orange" mt={2}>
              Reduced to the largest picture every browser can draw.
            </Text>
          )}
        </div>

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
        </div>

        {svg.includes('<text') && (
          <Text size="xs" c="dimmed">
            Text is drawn with the fonts on this computer, so a font the SVG does not include may look different in the picture.
          </Text>
        )}
        {loadsFromOtherSites(svg) && (
          <Text size="xs" c="orange">
            This drawing loads images or fonts from other websites. Browsers leave those out when they draw an SVG as a picture, so put them inside the SVG to be sure they appear.
          </Text>
        )}
        {error && <Text size="sm" c="red">{error}</Text>}

        <Group justify="flex-end" gap="xs">
          {canCopy && (
            <Button variant="default" leftSection={<IconCopy size={14} />} disabled={!!error || colourInvalid} loading={busy === 'copy'} onClick={() => run('copy')}>
              Copy image
            </Button>
          )}
          <Button leftSection={<IconDownload size={14} />} disabled={!!error || colourInvalid} loading={busy === 'download'} onClick={() => run('download')}>
            Download
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Stack, Group, Text, Button, SegmentedControl, NumberInput, ColorInput, Loader, ActionIcon, Tooltip } from '@mantine/core';
import { CHECKERBOARD_LIGHT } from '../lib/checkerboard';
import { PositionGrid } from './PositionGrid';
import { IconDownload, IconCopy, IconLink, IconLinkOff } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
  parseSvg, intrinsicSize, outputSize, renderImage, canEncode, isColour, loadsFromOtherSites, MAX_SIDE,
  type ImageFormat, type SizeChoice, type Align,
} from '../lib/svg-export';
import { trackExport } from '../lib/analytics';

/**
 * Export the drawing as a picture: PNG or WebP, at a scale or a custom size, on a transparent or
 * a solid background. The same settings the comparable tools offer — Figma's scale presets,
 * Inkscape's width, height and background — and no JPEG, which cannot be transparent and gives
 * nothing PNG does not.
 *
 * 1× is the drawing's own size, so what comes out matches what the SVG says it is; the pixel
 * size is shown before anything is saved, because 1× of a 24 px icon is a 24 px picture. The
 * last settings are remembered, so someone who always wants 4× chooses it once.
 *
 * A custom size keeps the drawing's proportions until the lock is opened. A box of another shape
 * — a square app icon from a wide logo — then needs to say where the drawing sits in it. The
 * drawing stays whole and undistorted, with margins where the shapes differ: that is SVG's own
 * preserveAspectRatio, so the picture is what a browser would show for the drawing in that box.
 */

type SizeMode = '1' | '2' | '4' | 'custom';
type Background = 'transparent' | 'white' | 'custom';

interface Settings {
  format: ImageFormat;
  sizeMode: SizeMode;
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
  format: 'png', sizeMode: '1', customWidth: 1024, customHeight: 1024, keepRatio: true,
  align: 'center', background: 'transparent', customColor: '#ffffff',
};

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

/** Figma's naming: name.png at 1×, name@2x.png at 2×; a custom size names its pixels. */
function outputName(base: string, settings: Settings, format: ImageFormat, size: { width: number; height: number }): string {
  const suffix = settings.sizeMode === 'custom' ? `-${size.width}x${size.height}`
    : settings.sizeMode === '1' ? '' : `@${settings.sizeMode}x`;
  return `${base}${suffix}.${format}`;
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
  const choice: SizeChoice = !custom ? { scale: Number(settings.sizeMode) }
    : box ? { width: settings.customWidth, height: settings.customHeight }
    : { width: settings.customWidth };
  const align: Align | undefined = box ? settings.align : undefined;
  const size = own && !('error' in own) ? outputSize(own, choice) : null;

  // A colour half typed into the picker is not one yet: nothing is drawn or saved with it.
  const colourInvalid = settings.background === 'custom' && !isColour(settings.customColor);
  const background = settings.background === 'transparent' ? null
    : settings.background === 'white' ? '#ffffff' : settings.customColor;
  const sizeLabel = custom ? 'custom' : `${settings.sizeMode}x`;

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
      // The clipboard takes PNG only, whatever format is chosen for saving.
      const output: ImageFormat = action === 'copy' ? 'png' : format;
      const result = await renderImage(svg, { size: choice, format: output, background, align });
      if ('error' in result) {
        notifications.show({ title: 'Could not export the picture', message: result.error, color: 'red' });
        return;
      }
      trackExport({ format: output, size: sizeLabel, background: settings.background, action });
      if (action === 'download') {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outputName(fileName, settings, output, result);
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
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
          <SegmentedControl
            fullWidth
            value={settings.sizeMode}
            onChange={(v) => update({ sizeMode: v as SizeMode })}
            data={[
              { value: '1', label: '1×' },
              { value: '2', label: '2×' },
              { value: '4', label: '4×' },
              { value: 'custom', label: 'Custom' },
            ]}
          />
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
          {size && (
            <Text size="sm" c="dimmed" mt={6} data-testid="export-size">
              {size.width} × {size.height} px
            </Text>
          )}
          {size?.reduced && (
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

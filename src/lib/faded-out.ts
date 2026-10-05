/**
 * Does an edit leave the drawing looking empty?
 *
 * Asked to delete a dark box or background and keep what was on it, the model deletes it — and
 * when what was on it is white or nearly white, it is left on nothing, so on a white page or the
 * light checkerboard the drawing looks blank. The edit did what it was told and users rejected
 * it. The model cannot see this coming from the markup, and an edit ends its turn, so the editor
 * checks the result itself and says so on the proposal.
 */

import { parseSvg, intrinsicSize, sizedMarkup, base64 } from './svg-export';

/** Shown on the proposal and sent back to the model, as it is: one whole sentence pair. */
export const FADED_OUT_WARNING =
  'What is left is white or nearly white with nothing behind it, so on a white page the drawing looks empty. Recolour it, or keep a background behind it.';

const SIZE = 96;
/** A pixel at 1.5:1 contrast or more stands out from the page. Cream on white (#f0ead6) does
 *  not, and a user rejected exactly that as a blank result. */
const SHOWS_ON_WHITE = 0.65;
const SHOWS_ON_BLACK = 0.025;
const MAX_CHARS = 1_500_000;

async function render(svg: string, background: string): Promise<Uint8ClampedArray | null> {
  const parsed = parseSvg(svg);
  if ('error' in parsed) return null;
  const own = intrinsicSize(parsed.root);
  const scale = SIZE / Math.max(own.width, own.height);
  const size = { width: Math.max(1, Math.round(own.width * scale)), height: Math.max(1, Math.round(own.height * scale)) };
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  let ctx: CanvasRenderingContext2D | null = null;
  try {
    ctx = canvas.getContext('2d');
  } catch {
    return null;
  }
  if (!ctx) return null;
  const img = new Image();
  const loaded = await new Promise<boolean>((resolve) => {
    // Never hang a turn on a picture that will not load.
    const timer = setTimeout(() => resolve(false), 3000);
    img.onload = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = `data:image/svg+xml;base64,${base64(sizedMarkup(parsed.doc, parsed.root, size))}`;
  });
  if (!loaded) return null;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size.width, size.height);
  try {
    ctx.drawImage(img, 0, 0, size.width, size.height);
    return ctx.getImageData(0, 0, size.width, size.height).data;
  } catch {
    return null;
  }
}

/** Relative luminance, as WCAG defines it, of one rendered pixel. */
function luminance(r: number, g: number, b: number): number {
  const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Share of pixels that show on white, and share that show on black, at a 1.5:1 contrast. */
async function coverage(svg: string): Promise<{ onWhite: number; onBlack: number } | null> {
  const white = await render(svg, '#ffffff');
  const black = await render(svg, '#000000');
  if (!white || !black) return null;
  let onWhite = 0, onBlack = 0;
  const n = white.length / 4;
  for (let i = 0; i < white.length; i += 4) {
    // Contrast against white is 1.05 / (L + 0.05), against black (L + 0.05) / 0.05.
    if (luminance(white[i], white[i + 1], white[i + 2]) <= SHOWS_ON_WHITE) onWhite++;
    if (luminance(black[i], black[i + 1], black[i + 2]) >= SHOWS_ON_BLACK) onBlack++;
  }
  return { onWhite: onWhite / n, onBlack: onBlack / n };
}

/**
 * The warning when `after` has content that no longer shows on white although `before` did,
 * or null. Null as well wherever the browser cannot render — the check is advice, never a gate.
 */
export async function fadedOutWarning(before: string, after: string): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  // Four renders per edit; a multi-megabyte trace is not worth holding the turn for.
  if (before.length > MAX_CHARS || after.length > MAX_CHARS) return null;
  const [was, now] = await Promise.all([coverage(before), coverage(after)]);
  if (!was || !now) return null;
  const visibleBefore = was.onWhite >= 0.01;
  const nearlyGone = now.onWhite < was.onWhite * 0.25;
  const stillThere = now.onBlack >= 0.005;
  return visibleBefore && nearlyGone && stillThere ? FADED_OUT_WARNING : null;
}

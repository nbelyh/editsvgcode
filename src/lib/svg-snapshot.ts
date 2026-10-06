/**
 * The drawing as a picture for the chat model to look at: get_png_image.
 *
 * Models fail most on traced art because every element is an anonymous <path>, so "the
 * coat" or "the hat" cannot be found by reading the markup. A picture alone did not fix
 * that — a model shown one still could not tell which path was which — so the picture can
 * HIGHLIGHT what an address matches: those elements in their own colours with a bright
 * outline, everything else faded. Up to four addresses at once, each in its own outline
 * colour, so candidates are compared in one look rather than one look each. And because a
 * whole diagram at any affordable size reduces small things to mush, it can CROP to a
 * region of the viewBox, drawn crisply at the full picture size rather than cut out of a
 * small one.
 */

import { parseSvg, intrinsicSize, base64 } from './svg-export';
import { resolveSelector, isSelectorError, describeNoMatch, describeMatches, isLineAddress, lineAddressToPath } from './svg-dom';
import { measureElements } from './svg-bounds';
import { baseLayerNote, drawingArea } from './path-parts';

export const SNAPSHOT_SIZES = [256, 512, 1024] as const;
const DEFAULT_SIZE = 512;

/** One outline colour per address, in the order given. Bright, and rarely what a drawing uses. */
const HIGHLIGHT_COLOURS = [
  { name: 'magenta', css: '#ff00ff' },
  { name: 'cyan', css: '#00c8ff' },
  { name: 'green', css: '#00c000' },
  { name: 'blue', css: '#2040ff' },
];
export const MAX_HIGHLIGHTS = HIGHLIGHT_COLOURS.length;
/** How far the outline reaches past the highlighted shapes, in picture pixels. */
const OUTLINE_PX = 3;
/** What is left of everything that is not highlighted. */
const FADED_ALPHA = 0.25;
const MARK = 'data-esvg-highlight';
/** How many of one address's matches the text names by path and line. */
const MAX_LISTED = 6;

export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SnapshotOptions {
  /** Addresses to highlight, each in its own colour. A bare string is one address. */
  highlight?: string | string[] | null;
  crop?: Crop | string | null;
  size?: number | string | null;
}

/** `text` is the tool result; `dataUrl` the picture, absent when there is none to show. */
export interface Snapshot {
  text: string;
  dataUrl?: string;
}

/** One highlighted address: what it matched, and the sentence the model reads about it. */
interface Group {
  colour: (typeof HIGHLIGHT_COLOURS)[number];
  elements: Element[];
  note: string;
}

const FAILED = 'Error: the browser could not draw this SVG as a picture.';

function viewBoxOf(root: Element): Crop | null {
  const parts = (root.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n)) || parts[2] <= 0 || parts[3] <= 0) return null;
  return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
}

const round = (n: number) => Math.round(n * 100) / 100;
const boxText = (b: Crop) => `x=${round(b.x)}, y=${round(b.y)}, width=${round(b.width)}, height=${round(b.height)}`;

/** The nearest offered size, so a model asking for 600 gets 512 rather than an error. */
function pickSize(size: number | null | undefined): number {
  if (typeof size !== 'number' || !Number.isFinite(size)) return DEFAULT_SIZE;
  return SNAPSHOT_SIZES.reduce((best, s) => (Math.abs(s - size) < Math.abs(best - size) ? s : best));
}

function loadImage(markup: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => resolve(null);
    el.src = `data:image/svg+xml;base64,${base64(markup)}`;
  });
}

/** What one address matched in `doc`, measured in the source `svg`, and how to say so. */
function resolveGroup(doc: Document, svg: string, address: string, colour: Group['colour'], area: number): Group {
  // A line is read against the source: this copy has had its root resized, and the
  // export parser it came from keeps no record of lines.
  const target = isLineAddress(address) ? lineAddressToPath(svg, address) : address;
  if (isSelectorError(target)) return { colour, elements: [], note: `"${address}": ${target.error}` };
  const found = resolveSelector(doc, target);
  if (isSelectorError(found)) return { colour, elements: [], note: `"${address}": ${found.error}` };
  if (found.length === 0) return { colour, elements: [], note: `"${address}" ${describeNoMatch(doc, target)}` };

  const measured = measureElements(svg, target);
  const boxes = 'error' in measured ? [] : measured.boxes;
  const count = `${found.length} element${found.length === 1 ? '' : 's'} match${found.length === 1 ? 'es' : ''} "${address}"`;
  if (boxes.length === 0) return { colour, elements: [], note: `${count}, but none of them is drawn, so nothing is outlined.` };

  const x1 = Math.min(...boxes.map((b) => b.x));
  const y1 = Math.min(...boxes.map((b) => b.y));
  const x2 = Math.max(...boxes.map((b) => b.x + b.width));
  const y2 = Math.max(...boxes.map((b) => b.y + b.height));
  const at = `${found.length === 1 ? 'at' : 'together at'} ${boxText({ x: x1, y: y1, width: x2 - x1, height: y2 - y1 })}`;
  const name = colour.name[0].toUpperCase() + colour.name.slice(1);
  // Where each match sits in the markup. Models took the numbered context's LINE for a
  // path's POSITION — path 8 is on line 9 — and highlighted /svg[1]/path[9] for it; saying
  // the line and the colour of what was outlined lets a wrong guess show itself.
  const listed = describeMatches(svg, doc, found.slice(0, MAX_LISTED)).map((m, i) => {
    const el = found[i];
    const paint = el.getAttribute('style') ? `style="${el.getAttribute('style')}"` : el.getAttribute('fill') ? `fill="${el.getAttribute('fill')}"` : '';
    const shown = paint.length > 60 ? `${paint.slice(0, 57)}…"` : paint;
    return `${m.path}${m.line ? ` on line ${m.line}` : ''}${shown ? ` with ${shown}` : ''}`;
  });
  const more = found.length > MAX_LISTED ? `; and ${found.length - MAX_LISTED} more` : '';
  // A match that is the base layer under the whole figure gets said so, once per address.
  // Boxes line up with matches only when every match is drawn; otherwise skip the check.
  const base = boxes.length === found.length
    ? found.map((el, i) => baseLayerNote(el, boxes[i].width * boxes[i].height, area)).find(Boolean)
    : null;
  return { colour, elements: found, note: `${name} outline: ${count}, ${at} — ${listed.join('; ')}${more}.${base ? ` ${base}` : ''}` };
}

/**
 * Arguments as some models send them. The schema asks for an array, an object and a number,
 * but a route that does not enforce it delivers each JSON-encoded inside a string —
 * "[\"line 2\", \"line 7\"]", "{\"x\": 100, …}", "1024" — or a list of addresses joined by
 * commas. Read literally, nearly every look failed and the model spent its rounds retrying.
 */
function decoded(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const text = value.trim();
  if (!/^[[{]/.test(text)) return value;
  try {
    return JSON.parse(text);
  } catch {
    return value;
  }
}

function highlightList(value: unknown): string[] {
  const raw = decoded(value);
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : [];
  return list
    .filter((a): a is string => typeof a === 'string')
    .flatMap((a) => {
      // "/svg[1]/path[7], /svg[1]/path[9]" is several addresses, not one CSS selector list:
      // a positional path or a line cannot appear inside CSS. Plain CSS keeps its commas.
      const parts = a.split(',').map((p) => p.trim()).filter(Boolean);
      return parts.length > 1 && parts.every((p) => p.startsWith('/') || isLineAddress(p)) ? parts : [a];
    })
    .map((a) => a.trim())
    .filter(Boolean);
}

function cropOf(value: unknown): Crop | null {
  const raw = decoded(value) as Record<string, unknown> | null | undefined;
  if (!raw || typeof raw !== 'object') return null;
  const n = (v: unknown) => (typeof v === 'string' ? Number(v) : (v as number));
  return { x: n(raw.x), y: n(raw.y), width: n(raw.width), height: n(raw.height) };
}

/**
 * Render the drawing, optionally highlighted and cropped. Never throws: whatever goes
 * wrong is said in `text`, which is what the model reads.
 */
export async function renderSnapshot(svg: string, options: SnapshotOptions = {}): Promise<Snapshot> {
  const parsed = parseSvg(svg);
  if ('error' in parsed) return { text: 'Error: the document is not well-formed SVG, so it cannot be drawn. Fix the markup first.' };

  const addresses = highlightList(options.highlight);
  if (addresses.length > MAX_HIGHLIGHTS) {
    return { text: `Error: at most ${MAX_HIGHLIGHTS} addresses can be highlighted at once, one outline colour each. Split them over several calls in the same response.` };
  }

  const own = viewBoxOf(parsed.root);
  const intrinsic = intrinsicSize(parsed.root);
  const whole: Crop = own ?? { x: 0, y: 0, width: intrinsic.width, height: intrinsic.height };

  const crop = cropOf(options.crop);
  if (crop && ![crop.x, crop.y, crop.width, crop.height].every(Number.isFinite)) {
    return { text: 'Error: crop needs four numbers — x, y, width and height in viewBox units.' };
  }
  if (crop && (crop.width <= 0 || crop.height <= 0)) {
    return { text: 'Error: crop width and height must be greater than zero.' };
  }
  const region = crop ?? whole;

  // The picture's pixels. With a crop the region's own proportions; without one, the
  // drawing's — its width and height when it has them, which can differ from the viewBox.
  const longest = pickSize(typeof options.size === 'string' ? Number(options.size) : options.size);
  const shape = crop ? region : intrinsic;
  const scale = longest / Math.max(shape.width, shape.height);
  const width = Math.max(1, Math.round(shape.width * scale));
  const height = Math.max(1, Math.round(shape.height * scale));

  const doc = parsed.doc.cloneNode(true) as Document;
  const root = doc.documentElement;
  root.setAttribute('viewBox', `${region.x} ${region.y} ${region.width} ${region.height}`);
  root.setAttribute('width', String(width));
  root.setAttribute('height', String(height));
  if (crop) root.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  // Resolve every address before anything is added to the copy, so a positional path
  // counts the same children the model's other tools count.
  // Measured on the drawing as it is, not on this copy: with a crop the copy's viewBox is the
  // crop, and the lens of a magnifying glass, 1% of the drawing, filled 64% of a crop around it
  // and was called the base layer under the whole figure — which the model is told never to
  // recolour.
  const area = drawingArea(parsed.doc);
  const groups = addresses.map((address, i) => resolveGroup(doc, svg, address, HIGHLIGHT_COLOURS[i], area));
  const shown = groups.filter((g) => g.elements.length > 0);
  if (addresses.length > 0 && shown.length === 0) return { text: groups.map((g) => g.note).join(' ') };

  const base = await loadImage(new XMLSerializer().serializeToString(doc));
  if (!base) return { text: FAILED };

  // The same drawing with everything hidden except some of the matches. visibility, unlike
  // display or opacity, can be switched back ON below a hidden ancestor — so a match inside
  // a group shows while the rest of the group does not. Every <svg> stays visible: WebKit
  // draws nothing at all under a hidden root, whatever its descendants say, and an <svg>
  // paints nothing of its own.
  shown.forEach((g, i) => {
    for (const el of g.elements) el.setAttribute(`${MARK}-${i}`, '');
  });
  const style = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
  root.insertBefore(style, root.firstChild);
  const only = (indexes: number[]) => {
    const marks = indexes.map((i) => `[${MARK}-${i}], [${MARK}-${i}] *`).join(', ');
    style.textContent = `* { visibility: hidden !important; } svg { visibility: visible !important; } ${marks} { visibility: visible !important; }`;
    return loadImage(new XMLSerializer().serializeToString(doc));
  };

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { text: FAILED };
  // Transparent areas would otherwise reach the model as black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = shown.length > 0 ? FADED_ALPHA : 1;
  ctx.drawImage(base, 0, 0, width, height);
  ctx.globalAlpha = 1;

  if (shown.length > 0) {
    // Each address's matches as one solid silhouette in its colour, stamped in a ring around
    // their real position — an outline — and then every match on top in its own colours.
    const tint = document.createElement('canvas');
    tint.width = width;
    tint.height = height;
    const tctx = tint.getContext('2d');
    if (!tctx) return { text: FAILED };
    for (let i = 0; i < shown.length; i++) {
      const img = await only([i]);
      if (!img) return { text: FAILED };
      tctx.globalCompositeOperation = 'source-over';
      tctx.clearRect(0, 0, width, height);
      tctx.drawImage(img, 0, 0, width, height);
      tctx.globalCompositeOperation = 'source-in';
      tctx.fillStyle = shown[i].colour.css;
      tctx.fillRect(0, 0, width, height);
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        ctx.drawImage(tint, Math.cos(a) * OUTLINE_PX, Math.sin(a) * OUTLINE_PX);
      }
    }
    const all = await only(shown.map((_, i) => i));
    if (!all) return { text: FAILED };
    ctx.drawImage(all, 0, 0, width, height);
  }

  let dataUrl: string;
  try {
    dataUrl = canvas.toDataURL('image/png');
  } catch {
    // A canvas the browser considers tainted will not hand its pixels out.
    return { text: 'Error: the browser would not export this picture.' };
  }

  const parts = [`${width}×${height} PNG of ${crop ? `the region ${boxText(region)}` : `the whole drawing (viewBox ${boxText(whole)})`}.`];
  parts.push(...groups.map((g) => g.note));
  if (shown.length > 0) {
    parts.push('Highlighted elements are drawn in their own colours, ringed in the outline colour named, over everything else, which is faded.');
  }
  parts.push('Transparent areas are shown white.');
  return { text: parts.join(' '), dataUrl };
}

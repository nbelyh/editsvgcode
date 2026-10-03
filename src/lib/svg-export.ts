/**
 * Exporting a drawing: as a picture (PNG, WebP), or as code in the forms people paste it into.
 *
 * Download was the most used action in the app — about 520 a day — and it only ever produced
 * the .svg itself. A picture for a slide or a post, or the markup in the shape a web page wants,
 * meant leaving for another tool.
 */

export type ImageFormat = 'png' | 'webp';

export const IMAGE_MIME: Record<ImageFormat, string> = { png: 'image/png', webp: 'image/webp' };

/**
 * The largest picture every browser will draw. iOS Safari refuses a canvas over 16.7 million
 * pixels and fails silently — a blank image — so a request past either limit is scaled down
 * to fit, and the panel says so.
 */
export const MAX_SIDE = 8192;
export const MAX_PIXELS = 16_777_216;

/** What a browser draws an SVG with no size at all as, for want of anything better. */
const FALLBACK_SIZE = { width: 300, height: 150 };

const UNIT_PX: Record<string, number> = {
  '': 1, px: 1, pt: 96 / 72, pc: 16, in: 96, cm: 96 / 2.54, mm: 96 / 25.4, q: 96 / 101.6, em: 16, ex: 8,
};

/** A width or height attribute in CSS pixels, or null for a percentage or nothing usable. */
function lengthPx(value: string | null): number | null {
  if (!value) return null;
  const m = /^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*([a-z%]*)\s*$/i.exec(value);
  if (!m) return null;
  const factor = UNIT_PX[m[2].toLowerCase()];
  const n = parseFloat(m[1]) * (factor ?? NaN);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function viewBoxOf(root: Element): { width: number; height: number } | null {
  const parts = (root.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n)) || parts[2] <= 0 || parts[3] <= 0) return null;
  return { width: parts[2], height: parts[3] };
}

const SVG_NS = 'http://www.w3.org/2000/svg';

function parseXml(svg: string): { doc: Document; root: Element } | null {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const root = doc.documentElement;
  if (doc.getElementsByTagName('parsererror').length > 0 || root.localName !== 'svg' || root.namespaceURI !== SVG_NS) return null;
  return { doc, root };
}

/**
 * Parse the document, or say why it cannot be exported. The preview reads the markup the way a
 * web page does, which forgives what strict SVG does not: no xmlns, xlink:href with its prefix
 * never declared, &nbsp; and the other HTML entities — the usual state of an SVG copied out of
 * a page. Export refused all of these while the preview showed them, so markup that is not
 * strict SVG is read the preview's way and written back out as strict SVG.
 */
export function parseSvg(svg: string): { doc: Document; root: Element } | { error: string } {
  const strict = parseXml(svg);
  if (strict) return strict;
  const lenient = new DOMParser().parseFromString(svg, 'text/html').querySelector('svg');
  const rewritten = lenient && parseXml(new XMLSerializer().serializeToString(lenient));
  return rewritten || { error: 'The drawing has an error in its code, so it cannot be exported. Fix it in the editor first.' };
}

/**
 * Whether a background colour is one a browser can paint. A colour half typed into the picker —
 * "#ff" — is not, and the canvas silently kept its default black instead.
 */
export function isColour(value: string): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('color', value);
}

/**
 * The drawing's own size in pixels — what "1×" means. The width and height attributes when
 * they are lengths; one of them and the viewBox's proportions when only one is; the viewBox
 * when neither is; and what a browser falls back to when there is nothing at all.
 */
export function intrinsicSize(root: Element): { width: number; height: number } {
  const w = lengthPx(root.getAttribute('width'));
  const h = lengthPx(root.getAttribute('height'));
  const box = viewBoxOf(root);
  if (w && h) return { width: w, height: h };
  if (w && box) return { width: w, height: (w * box.height) / box.width };
  if (h && box) return { width: (h * box.width) / box.height, height: h };
  if (box) return box;
  return { width: w ?? FALLBACK_SIZE.width, height: h ?? FALLBACK_SIZE.height };
}

/**
 * A scale of the drawing's own size; a width with the height following; or an exact box, which
 * may not have the drawing's proportions — where it sits in that box is the Align.
 */
export type SizeChoice = { scale: number } | { width: number } | { width: number; height: number };

/** Where the drawing sits in a box of a different shape. It is always whole and undistorted. */
export type Align = 'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';

const ALIGN_X: Record<string, string> = { left: 'xMin', right: 'xMax' };
const ALIGN_Y: Record<string, string> = { top: 'YMin', bottom: 'YMax' };

/**
 * The position as SVG's own preserveAspectRatio, so the browser's renderer does the fitting —
 * exactly as it would for the drawing anywhere else. "top-left" → "xMinYMin meet".
 */
export function preserveAspectRatio(align: Align): string {
  const parts = align.split('-');
  const x = parts.map((p) => ALIGN_X[p]).find(Boolean) ?? 'xMid';
  const y = parts.map((p) => ALIGN_Y[p]).find(Boolean) ?? 'YMid';
  return `${x}${y} meet`;
}

/**
 * The pixel size of the picture for a choice of scale, width or box, kept within what browsers
 * will draw. `reduced` says the request was larger than that and was scaled down to fit.
 */
export function outputSize(intrinsic: { width: number; height: number }, choice: SizeChoice) {
  let width: number;
  let height: number;
  if ('height' in choice) {
    width = choice.width;
    height = choice.height;
  } else {
    const factor = 'scale' in choice ? choice.scale : choice.width / intrinsic.width;
    width = intrinsic.width * factor;
    height = intrinsic.height * factor;
  }
  const fit = Math.min(1, MAX_SIDE / Math.max(width, height), Math.sqrt(MAX_PIXELS / (width * height)));
  width = Math.max(1, Math.round(width * fit));
  height = Math.max(1, Math.round(height * fit));
  return { width, height, reduced: fit < 1 };
}

/**
 * The markup sized to the exact pixels wanted. Safari draws an SVG image at its own declared
 * size and stretches the result, so a 4× picture drawn by scaling the canvas came out blurry;
 * a document that declares the target size is drawn crisply everywhere. A viewBox is added when
 * the drawing has none, or the new size would crop it instead of scaling it. A position, given
 * for a box of a different shape, becomes the root's preserveAspectRatio.
 */
export function sizedMarkup(doc: Document, root: Element, size: { width: number; height: number }, align?: Align): string {
  const copy = doc.cloneNode(true) as Document;
  const svg = copy.documentElement;
  if (!viewBoxOf(svg)) {
    const own = intrinsicSize(root);
    svg.setAttribute('viewBox', `0 0 ${own.width} ${own.height}`);
  }
  svg.setAttribute('width', String(size.width));
  svg.setAttribute('height', String(size.height));
  if (align) svg.setAttribute('preserveAspectRatio', preserveAspectRatio(align));
  return new XMLSerializer().serializeToString(copy);
}

const encodable = new Map<ImageFormat, boolean>();

/**
 * Whether this browser can write the format at all. Safari cannot encode WebP from a canvas and
 * quietly hands back a PNG instead — offered there, "WebP" saved a PNG under a .webp name.
 */
export function canEncode(format: ImageFormat): boolean {
  if (format === 'png') return true;
  if (!encodable.has(format)) {
    let ok = false;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      ok = canvas.toDataURL(IMAGE_MIME[format]).startsWith(`data:${IMAGE_MIME[format]}`);
    } catch { /* no canvas: not offered */ }
    encodable.set(format, ok);
  }
  return encodable.get(format)!;
}

/** UTF-8 safe base64, which plain btoa is not. */
export function base64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

/**
 * Whether the drawing pulls in images, fonts or styles from other websites. A browser drawing an
 * SVG as a picture fetches none of it — Firefox and Safari leave it out — so what shows in the
 * editor can be missing from the export.
 */
export function loadsFromOtherSites(svg: string): boolean {
  // Only what is loaded: <image>, <use> and <feImage>; an <a href> to another site is just a link.
  return /<(?:image|use|feImage)\b[^>]*\bhref\s*=\s*["']\s*(?:https?:)?\/\//i.test(svg) || /url\(\s*["']?\s*(?:https?:)?\/\//i.test(svg) || /@import\b/i.test(svg);
}

/** Render the drawing to a picture, or say why it could not be. */
export async function renderImage(
  svg: string,
  options: { size: SizeChoice; format: ImageFormat; background: string | null; align?: Align },
): Promise<{ blob: Blob; width: number; height: number; reduced: boolean } | { error: string }> {
  const parsed = parseSvg(svg);
  if ('error' in parsed) return parsed;
  const size = outputSize(intrinsicSize(parsed.root), options.size);
  const src = `data:image/svg+xml;base64,${base64(sizedMarkup(parsed.doc, parsed.root, size, options.align))}`;

  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => resolve(null);
    el.src = src;
  });
  if (!img) return { error: 'The browser could not draw this SVG as a picture.' };

  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { error: 'The browser could not draw this SVG as a picture.' };
  if (options.background && isColour(options.background)) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, size.width, size.height);
  }
  ctx.drawImage(img, 0, 0, size.width, size.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    try {
      canvas.toBlob(resolve, IMAGE_MIME[options.format]);
    } catch {
      // A canvas the browser considers tainted will not hand its pixels out.
      resolve(null);
    }
  });
  if (!blob) {
    return { error: 'The browser would not export this picture.' };
  }
  return { blob, width: size.width, height: size.height, reduced: size.reduced };
}

// --- Copy as code -------------------------------------------------------------------------

/**
 * The markup as strict SVG, which is all an <img> or a CSS url() will draw: unchanged when it
 * already is, and otherwise rewritten the way parseSvg reads it — an SVG with no xmlns, say,
 * shows in the editor but is a broken image as a data URI.
 */
function strictSvg(svg: string): string {
  if (parseXml(svg)) return svg.trim();
  const parsed = parseSvg(svg);
  return 'error' in parsed ? svg.trim() : new XMLSerializer().serializeToString(parsed.root);
}

/** For an <img src>, a CSS url() or anywhere a URL goes. Percent-encoded, so it is safe in quotes. */
export function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(strictSvg(svg))}`;
}

export function svgBase64DataUri(svg: string): string {
  return `data:image/svg+xml;base64,${base64(strictSvg(svg))}`;
}

export function cssBackground(svg: string): string {
  return `background-image: url("${svgDataUri(svg)}");`;
}

/** A file name turned into a component name: "my-logo" → MyLogo. */
export function componentName(fileName: string): string {
  const words = fileName.replace(/\.svg$/i, '').split(/[^A-Za-z0-9]+/).filter(Boolean);
  const name = words.map((w) => w[0].toUpperCase() + w.slice(1)).join('');
  if (!name) return 'SvgImage';
  return /^[A-Z]/.test(name) ? name : `Svg${name}`;
}

/** Attribute names React spells differently from SVG. Everything else hyphenated is camelCased. */
const REACT_ATTR: Record<string, string> = {
  class: 'className', 'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace', 'xml:lang': 'xmlLang',
  'xmlns:xlink': 'xmlnsXlink', for: 'htmlFor',
};

function reactAttrName(name: string): string | null {
  if (REACT_ATTR[name]) return REACT_ATTR[name];
  if (name.startsWith('data-') || name.startsWith('aria-')) return name;
  // Editor bookkeeping — inkscape:label, sodipodi:docname — has no meaning in React and a colon
  // is not valid in a JSX attribute name.
  if (name.includes(':')) return null;
  return name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** "fill: red; stroke-width: 2" → {{ fill: 'red', strokeWidth: '2' }} */
function reactStyle(style: string): string {
  // Not at a semicolon inside parentheses: url(data:image/png;base64,…) is one value.
  const entries = style.split(/;(?![^(]*\))/).map((decl) => decl.split(':')).filter((kv) => kv.length >= 2 && kv[0].trim())
    .map(([k, ...v]) => {
      const prop = k.trim();
      const key = prop.startsWith('--') ? JSON.stringify(prop) : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      return `${key}: ${JSON.stringify(v.join(':').trim())}`;
    });
  return `{{ ${entries.join(', ')} }}`;
}

function jsxAttrValue(value: string): string {
  return /["{}<>&\n]/.test(value) ? `{${JSON.stringify(value)}}` : `"${value}"`;
}

/**
 * The drawing as a React component. Attributes take React's spelling, style strings become
 * objects, editor bookkeeping (comments, inkscape: and sodipodi: markup) is dropped, and the
 * root passes its props on, so the component can be sized and styled where it is used.
 */
export function reactComponent(svg: string, fileName: string): string | { error: string } {
  const parsed = parseSvg(svg);
  if ('error' in parsed) return parsed;

  const lines: string[] = [];
  const emit = (node: Node, depth: number, isRoot: boolean) => {
    const pad = '  '.repeat(depth);
    if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE) {
      const text = node.textContent ?? '';
      if (!text.trim() && /\n/.test(text)) return; // indentation between elements
      // As a string expression, so braces, angle brackets and the CSS in a <style> all survive.
      lines.push(`${pad}{${JSON.stringify(text)}}`);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return; // comments, processing instructions
    const el = node as Element;
    if (el.prefix) return; // sodipodi:namedview and the like

    const attrs: string[] = [];
    for (const attr of Array.from(el.attributes)) {
      const name = reactAttrName(attr.name);
      if (!name) continue;
      attrs.push(name === 'style' ? `style=${reactStyle(attr.value)}` : `${name}=${jsxAttrValue(attr.value)}`);
    }
    if (isRoot) attrs.push('{...props}');
    const open = `${pad}<${el.tagName}${attrs.length ? ` ${attrs.join(' ')}` : ''}`;
    const children = Array.from(el.childNodes).filter((c) =>
      (c.nodeType === Node.ELEMENT_NODE && !(c as Element).prefix)
      || ((c.nodeType === Node.TEXT_NODE || c.nodeType === Node.CDATA_SECTION_NODE) && !(!(c.textContent ?? '').trim() && /\n/.test(c.textContent ?? ''))));
    if (children.length === 0) {
      lines.push(`${open} />`);
      return;
    }
    lines.push(`${open}>`);
    for (const child of children) emit(child, depth + 1, false);
    lines.push(`${pad}</${el.tagName}>`);
  };
  emit(parsed.root, 2, true);

  const name = componentName(fileName);
  return [
    `export default function ${name}(props) {`,
    '  return (',
    ...lines,
    '  );',
    '}',
    '',
  ].join('\n');
}

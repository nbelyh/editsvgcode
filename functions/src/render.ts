import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { Resvg, type ResvgRenderOptions } from "@resvg/resvg-js";
import type { ElementBounds, Measurement } from "../../src/lib/svg-bounds";
import { FADED_ALPHA, OUTLINE_PX, type PaintJob, type SnapshotBackend } from "../../src/lib/svg-snapshot";
import { intrinsicSize, parseSvg } from "../../src/lib/svg-export";
import { isLineAddress, isSelectorError, lineAddressToPath, resolveSelector } from "../../src/lib/svg-dom";

/**
 * The editor's get_png_image and get_element_bounds draw and measure through the browser
 * (src/lib/svg-snapshot.ts, svg-bounds.ts). The MCP server has none, so it does both with resvg:
 * the same layers, composited the same way, and boxes in the same viewBox units.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Fonts for text. A Cloud Functions machine has hardly any, and resvg draws no text at all when
 * it finds none, so the DejaVu families come with the function; a family it does not have, such
 * as Arial or Georgia, falls back to them by its generic name or to DejaVu Sans.
 */
const FONT_DIR = join(dirname(createRequire(import.meta.url).resolve("dejavu-fonts-ttf/package.json")), "ttf");
const TEXT_FONTS: ResvgRenderOptions["font"] = {
  loadSystemFonts: false,
  fontFiles: [
    "DejaVuSans.ttf", "DejaVuSans-Bold.ttf", "DejaVuSans-Oblique.ttf", "DejaVuSans-BoldOblique.ttf",
    "DejaVuSerif.ttf", "DejaVuSerif-Bold.ttf", "DejaVuSerif-Italic.ttf", "DejaVuSerif-BoldItalic.ttf",
    "DejaVuSansMono.ttf", "DejaVuSansMono-Bold.ttf",
  ].map((f) => join(FONT_DIR, f)),
  defaultFontFamily: "DejaVu Sans",
  sansSerifFamily: "DejaVu Sans",
  serifFamily: "DejaVu Serif",
  monospaceFamily: "DejaVu Sans Mono",
  cursiveFamily: "DejaVu Serif",
  fantasyFamily: "DejaVu Sans",
};

const hasText = (markup: string) => /<(text|tspan|textPath)\b/i.test(markup);

/** Loading the fonts is most of the time a small drawing takes, so only markup with text gets them. */
function options(markup: string, extra: ResvgRenderOptions = {}): ResvgRenderOptions {
  return { ...extra, font: hasText(markup) ? TEXT_FONTS : { loadSystemFonts: false } };
}

const SERIF_NAMES = /^(georgia|times|times new roman|garamond|cambria|constantia|palatino|palatino linotype|book antiqua|baskerville|libre baskerville|didot|bodoni|lora|merriweather|playfair display|pt serif|noto serif|droid serif)$/i;
const MONO_NAMES = /^(courier|courier new|consolas|menlo|monaco|lucida console|source code pro|fira code|roboto mono|ubuntu mono|jetbrains mono)$/i;

/**
 * A font-family list resvg will resolve as a browser would. resvg 2.6 ignores its own generic
 * family settings (serif came out in the sans default) and skips a quoted name ('DejaVu Serif'
 * matched nothing): so names go unquoted, the generics become the DejaVu faces, and a well-known
 * serif or monospace face it does not have is followed by the DejaVu one of its kind.
 */
function fontFamilies(list: string): string {
  const names = list.replace(/&quot;|&apos;|&#3[49];/g, '"').split(",")
    .map((n) => n.trim().replace(/^(["'])(.*)\1$/, "$2").trim()).filter(Boolean);
  const out = names.map((n) => (/^serif$/i.test(n) ? "DejaVu Serif" : /^monospace$/i.test(n) ? "DejaVu Sans Mono" : n));
  const kind = names.some((n) => SERIF_NAMES.test(n)) ? "DejaVu Serif" : names.some((n) => MONO_NAMES.test(n)) ? "DejaVu Sans Mono" : null;
  if (kind && !out.includes(kind)) out.push(kind);
  return out.join(", ");
}

/** resvg reads only SVG-namespaced markup; a browser shown the editor's own text is more forgiving. */
function prepared(markup: string): string {
  let svg = /<svg\b[^>]*\sxmlns\s*=/.test(markup) ? markup : markup.replace(/<svg\b/, `<svg xmlns="${SVG_NS}"`);
  if (hasText(svg)) {
    svg = svg
      .replace(/(font-family\s*=\s*)"([^"]*)"/gi, (_m, lead: string, v: string) => `${lead}"${fontFamilies(v)}"`)
      .replace(/(font-family\s*=\s*)'([^']*)'/gi, (_m, lead: string, v: string) => `${lead}'${fontFamilies(v)}'`)
      .replace(/(font-family\s*:\s*)([^;}"<]+)/gi, (_m, lead: string, v: string) => `${lead}${fontFamilies(v)}`);
  }
  return svg;
}

function draw(markup: string, extra: ResvgRenderOptions = {}): Buffer {
  return new Resvg(prepared(markup), options(markup, extra)).render().asPng();
}

const pngUrl = (png: Buffer) => `data:image/png;base64,${png.toString("base64")}`;

/**
 * The layers, each drawn on its own, then stacked in one more drawing: the faded base, each
 * address's matches as a silhouette in its colour grown by OUTLINE_PX (the canvas stamps it in a
 * ring of 16 offsets; feMorphology grows it in one step), and every match in its own colours.
 */
async function paint({ width, height, base, rings, top }: PaintJob): Promise<{ dataUrl: string } | { error: string }> {
  try {
    if (!top) return { dataUrl: pngUrl(draw(base, { background: "#ffffff" })) };
    const image = (markup: string, attrs = "") =>
      `<image x="0" y="0" width="${width}" height="${height}" ${attrs} href="${pngUrl(draw(markup))}"/>`;
    const filters = rings.map((r, i) =>
      `<filter id="ring${i}" x="0" y="0" width="${width}" height="${height}" filterUnits="userSpaceOnUse">`
      + `<feMorphology in="SourceAlpha" operator="dilate" radius="${OUTLINE_PX}" result="grown"/>`
      + `<feFlood flood-color="${r.css}"/><feComposite in2="grown" operator="in"/></filter>`);
    const stack = `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
      + `<defs>${filters.join("")}</defs>`
      + `<rect width="${width}" height="${height}" fill="#ffffff"/>`
      + image(base, `opacity="${FADED_ALPHA}"`)
      + rings.map((r, i) => image(r.markup, `filter="url(#ring${i})"`)).join("")
      + image(top)
      + `</svg>`;
    return { dataUrl: pngUrl(new Resvg(stack).render().asPng()) };
  } catch {
    return { error: "Error: this SVG could not be drawn as a picture." };
  }
}

/** Never drawn themselves; kept whole, since what is drawn may refer to them. */
const NON_RENDERING = new Set([
  "defs", "clippath", "mask", "pattern", "marker", "symbol", "lineargradient", "radialgradient",
  "filter", "style", "metadata", "title", "desc", "script", "font", "font-face",
]);
/** What a browser counts as an SVGGraphicsElement, the elements getBBox measures. */
const GRAPHICS = new Set([
  "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "tspan", "textpath",
  "use", "image", "svg", "a", "switch", "foreignobject",
]);

const nameOf = (el: Element) => el.localName.toLowerCase();

function insideNonRendering(el: Element): boolean {
  for (let p = el.parentElement; p; p = p.parentElement) if (NON_RENDERING.has(nameOf(p))) return true;
  return false;
}

/** The child indexes from the root down to `el`, to find its copy in a cloned document. */
function indexPath(el: Element): number[] {
  const path: number[] = [];
  for (let node = el; node.parentElement; node = node.parentElement) {
    path.unshift(Array.prototype.indexOf.call(node.parentElement.children, node));
  }
  return path;
}

/**
 * The drawing with nothing drawn but `el`: resvg's box covers everything it draws, hidden or
 * not, so the rest is taken out rather than hidden. Its ancestors stay, for their transforms and
 * inherited styles, and so do the never-drawn containers; what a <use> inside it points at moves
 * into <defs>, where it still resolves but is not drawn.
 */
function isolate(doc: Document, el: Element): string {
  const copy = doc.cloneNode(true) as Document;
  const root = copy.documentElement;
  let target: Element = root;
  for (const i of indexPath(el)) target = target.children[i];

  const wanted = new Set<string>();
  for (const node of [target, ...Array.from(target.querySelectorAll("*"))]) {
    const href = node.getAttribute("href") ?? node.getAttributeNS("http://www.w3.org/1999/xlink", "href");
    if (href?.startsWith("#")) wanted.add(href.slice(1));
  }
  let defs: Element | null = null;
  const prune = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      if (child === target || NON_RENDERING.has(nameOf(child))) continue;
      if (child.contains(target)) {
        prune(child);
        continue;
      }
      if ([child, ...Array.from(child.querySelectorAll("[id]"))].some((e) => wanted.has(e.getAttribute("id") ?? ""))) {
        defs ??= root.insertBefore(copy.createElementNS(SVG_NS, "defs"), root.firstChild);
        defs.appendChild(child);
        continue;
      }
      child.remove();
    }
  };
  if (target !== root) prune(root);
  return new XMLSerializer().serializeToString(copy);
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Each match drawn alone is one resvg pass; past this many the rest are counted, not measured. */
const MAX_MEASURED = 40;

/** svg-bounds.ts measureElements, without a browser: what each match draws, in viewBox units. */
export function measureWithResvg(svgCode: string, selector: string, limit = Infinity): Measurement | { error: string } {
  const parsed = parseSvg(svgCode);
  if ("error" in parsed) return { error: "Error: the document is not well-formed SVG, so nothing in it can be measured." };
  const { doc, root } = parsed;
  const target = isLineAddress(selector) ? lineAddressToPath(svgCode, selector) : selector;
  if (isSelectorError(target)) return { error: `Error: ${target.error}` };
  const found = resolveSelector(doc, target);
  if (isSelectorError(found)) return { error: `Error: ${found.error}` };

  const boxes: ElementBounds[] = [];
  for (const el of found.slice(0, Math.min(limit, MAX_MEASURED))) {
    if (!GRAPHICS.has(nameOf(el)) || insideNonRendering(el)) continue;
    let box: { x: number; y: number; width: number; height: number } | undefined;
    try {
      const markup = isolate(doc, el);
      box = new Resvg(prepared(markup), options(markup)).getBBox();
    } catch {
      continue;
    }
    if (!box) continue;
    boxes.push({
      selector,
      tagName: el.tagName.toLowerCase(),
      id: el.getAttribute("id") || undefined,
      x: round(box.x),
      y: round(box.y),
      width: round(box.width),
      height: round(box.height),
    });
  }
  return {
    viewBox: root.getAttribute("viewBox") || "not set",
    width: root.getAttribute("width") || "auto",
    height: root.getAttribute("height") || "auto",
    matched: found.length,
    boxes,
  };
}

export const resvgBackend: SnapshotBackend = { measure: measureWithResvg, paint };

/** export_document's PNG: the drawing with its longest side `size` pixels, transparent where it is. */
export function drawPng(svg: string, size: number): Buffer {
  // Read as the editor reads it (svg-export.ts parseSvg): a drawing pasted from a web page, with
  // an undeclared xlink: prefix or an &nbsp;, previews and exports there, and resvg's strict
  // parser alone refused it. The parse also gives the proportions, without a first render.
  const parsed = parseSvg(svg);
  const source = "error" in parsed ? svg : new XMLSerializer().serializeToString(parsed.doc);
  // Unparsed, resvg's own size gives the proportions: fitted by width, a tall drawing came out
  // as tall as it liked and could ask for gigabytes.
  const shape = "error" in parsed ? new Resvg(prepared(source), options(source)) : intrinsicSize(parsed.root);
  const mode = shape.width >= shape.height ? "width" : "height";
  return new Resvg(prepared(source), options(source, { fitTo: { mode, value: size } })).render().asPng();
}

/** The icons a search found, numbered, in one picture: what the model picks from, by eye. */
export function iconSheet(icons: { svg: string }[]): string {
  const cell = 96, pad = 14, columns = Math.min(4, icons.length);
  const rows = Math.ceil(icons.length / columns);
  const cells = icons.map((icon, i) => {
    const x = (i % columns) * cell, y = Math.floor(i / columns) * cell;
    const inner = icon.svg.replace(/<svg\b([^>]*)>/, (_m, attrs: string) =>
      `<svg${attrs.replace(/\s(x|y|width|height)="[^"]*"/g, "")} x="${x + pad}" y="${y + pad}" width="${cell - 2 * pad}" height="${cell - 2 * pad}">`);
    return `<rect x="${x + 1}" y="${y + 1}" width="${cell - 2}" height="${cell - 2}" rx="6" fill="#ffffff" stroke="#d0d4d9"/>`
      + inner
      + `<text x="${x + 6}" y="${y + 15}" font-family="DejaVu Sans" font-size="12" fill="#666666">${i + 1}</text>`;
  });
  const markup = `<svg xmlns="${SVG_NS}" width="${columns * cell}" height="${rows * cell}" viewBox="0 0 ${columns * cell} ${rows * cell}">`
    + `<rect width="100%" height="100%" fill="#f4f5f7"/>${cells.join("")}</svg>`;
  return draw(markup).toString("base64");
}

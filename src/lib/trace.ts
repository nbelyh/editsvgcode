/**
 * The tracer: a PNG into SVG paths with vtracer-webapp (the engine of visioncortex.org/vtracer),
 * in the browser. Apart from image-gen.ts, which asks the API for pictures, so that a page with
 * no sign-in of its own (the MCP widget, src/mcp-widget/picture.tsx) can trace too.
 */

export interface VectorizerParams {
  mode: 'spline' | 'polygon' | 'none';
  clusteringMode: 'color' | 'binary';
  hierarchical: 'stacked' | 'cutout';
  filterSpeckle: number;     // 1–16
  colorPrecision: number;    // 1–8
  layerDifference: number;   // 0–64
  cornerThreshold: number;   // 0–180 degrees
  lengthThreshold: number;   // 1–20
  spliceThreshold: number;   // 0–180 degrees
  pathPrecision: number;     // 0–16
}

/**
 * vtracer's own defaults for speckle and colour precision. The tracer used to filter specks
 * under 10x10 pixels and keep 4 bits of colour, which on a detailed portrait kept 43 shapes and
 * lost the hat's ribs, the eyes and the shading; at these settings the SVG is hard to tell from
 * the picture. Most pictures stay small at them; traceToFit steps back for the few that do not.
 */
export const DEFAULT_VECTORIZER_PARAMS: VectorizerParams = {
  mode: 'spline',
  clusteringMode: 'color',
  hierarchical: 'stacked',
  filterSpeckle: 4,
  colorPrecision: 6,
  layerDifference: 16,
  cornerThreshold: 60,
  lengthThreshold: 4,
  spliceThreshold: 45,
  pathPrecision: 0,
};

/**
 * The most SVG a traced picture may come to. A chat message is one Firestore document, limited
 * to 1 MiB, it holds the traced SVG, and the whole chat is saved in one batch: past this the
 * chat would stop saving. Measured: a detailed gpt-image-1.5 portrait came to 755 KB at the
 * default settings and 449 KB one step back; a typical mini picture is under 100 KB either way.
 */
export const MAX_TRACE_CHARS = 700_000;

/** The settings the tracer used before the defaults moved to vtracer's own. Pictures traced
 *  then were traced at these, and their sliders open at them. */
export const LEGACY_VECTORIZER_PARAMS: VectorizerParams = { ...DEFAULT_VECTORIZER_PARAMS, filterSpeckle: 10, colorPrecision: 4 };

/** Coarser settings to fall back on, in order, when a trace is over the limit. */
const FALLBACK_PARAMS: VectorizerParams[] = [
  { ...DEFAULT_VECTORIZER_PARAMS, filterSpeckle: 6, colorPrecision: 5 },
  LEGACY_VECTORIZER_PARAMS,
];

/**
 * Trace at the default settings, stepping back to coarser ones while the SVG is over the
 * limit. Returns the settings used, so the sliders can open at them. The coarsest trace is
 * returned even if it is still over: the caller decides what to do with it.
 */
export async function traceToFit(imageUrl: string): Promise<{ svg: string; params: VectorizerParams }> {
  let params = DEFAULT_VECTORIZER_PARAMS;
  let svg = await vectorize(imageUrl, params);
  for (const fallback of FALLBACK_PARAMS) {
    if (svg.length <= MAX_TRACE_CHARS) break;
    params = fallback;
    svg = await vectorize(imageUrl, params);
  }
  return { svg, params };
}

/**
 * Vectorize a PNG image URL (data URL or object URL) to SVG with the given params.
 */
export async function vectorize(
  imageUrl: string,
  params: VectorizerParams = DEFAULT_VECTORIZER_PARAMS,
): Promise<string> {
  return vectorizeInBrowser(imageUrl, params);
}

/**
 * Load base64 PNG into a canvas, then vectorize with vtracer-webapp (same engine as visioncortex.org/vtracer).
 * The converter reads pixels from a canvas DOM element and writes SVG paths to an SVG DOM element.
 */
async function vectorizeInBrowser(imageUrl: string, params: VectorizerParams = DEFAULT_VECTORIZER_PARAMS): Promise<string> {
  const img = await loadImage(imageUrl);

  // Create temporary DOM elements — the WASM converter accesses them by ID
  const canvasId = '__vtracer_canvas__';
  const svgId = '__vtracer_svg__';

  const canvas = document.createElement('canvas');
  canvas.id = canvasId;
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.style.display = 'none';

  const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgEl.id = svgId;
  svgEl.setAttribute('viewBox', `0 0 ${img.width} ${img.height}`);
  svgEl.style.display = 'none';

  document.body.appendChild(canvas);
  document.body.appendChild(svgEl);

  try {
    const ctx = canvas.getContext('2d')!;

    // Draw image preserving alpha channel.
    // vtracer-webapp has built-in keying: it detects transparent pixels,
    // finds an unused key color, and uses KeyingAction to discard keyed clusters.
    ctx.drawImage(img, 0, 0);

    // Clean up semi-transparent boundary pixels to prevent noisy edges.
    // GPT-Image produces anti-aliased edges with partial alpha; those create
    // many tiny speckle clusters in vtracer. Snap alpha to 0 or 255.
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 3; i < data.length; i += 4) {
      data[i] = data[i] < 128 ? 0 : 255;
    }
    ctx.putImageData(imageData, 0, 0);

    const { ColorImageConverter } = await import('vtracer-webapp');

    const deg2rad = (deg: number) => (deg / 180) * Math.PI;

    const vtracerParams = JSON.stringify({
      canvas_id: canvasId,
      svg_id: svgId,
      mode: params.mode,
      clustering_mode: params.clusteringMode,
      hierarchical: params.hierarchical,
      filter_speckle: params.filterSpeckle * params.filterSpeckle,
      color_precision: 8 - params.colorPrecision,
      layer_difference: params.layerDifference,
      corner_threshold: deg2rad(params.cornerThreshold),
      length_threshold: params.lengthThreshold,
      splice_threshold: deg2rad(params.spliceThreshold),
      path_precision: params.pathPrecision,
      max_iterations: 10,
    });

    const converter = ColorImageConverter.new_with_string(vtracerParams);

    converter.init();
    while (!converter.tick()) {
      // incremental processing — converter writes SVG paths into svgEl
    }

    converter.free();

    // Clean up temporary attributes before serialization
    svgEl.removeAttribute('id');
    svgEl.removeAttribute('style');
    svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    return formatSvg(new XMLSerializer().serializeToString(svgEl));
  } finally {
    document.body.removeChild(canvas);
    document.body.removeChild(svgEl);
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

/** Pretty-print a flat SVG string so each element is on its own line. */
function formatSvg(raw: string): string {
  // Insert newlines before every opening '<' that isn't the very first character
  let formatted = raw.replace(/>\s*</g, '>\n<');
  // Indent child elements (anything that isn't the root <svg> or </svg>)
  const lines = formatted.split('\n');
  const result: string[] = [];
  let indent = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const isClosing = /^<\//.test(trimmed);
    const isSelfClosing = /\/>$/.test(trimmed);
    if (isClosing) indent = Math.max(0, indent - 1);
    result.push('  '.repeat(indent) + trimmed);
    if (!isClosing && !isSelfClosing && /^<[^/!?]/.test(trimmed)) indent++;
  }
  return result.join('\n');
}

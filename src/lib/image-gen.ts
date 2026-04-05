import { getAuth } from 'firebase/auth';
import type { TokenUsage } from './pricing';

export type ImageProgressStatus = 'generating-image' | 'vectorizing';

const API_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * Generate an SVG from a text prompt.
 * Server generates raster image (binary PNG), client vectorizes with vtracer in browser.
 */
export async function generateImage(
  prompt: string,
  signal?: AbortSignal,
  onProgress?: (status: ImageProgressStatus) => void,
): Promise<{ svg: string; credits: { remaining: number; limit: number }; tokens?: TokenUsage }> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const idToken = await user.getIdToken();

  const res = await fetch(`${API_URL}/api/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ prompt }),
    signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }

  const credits = {
    remaining: Number(res.headers.get('X-Credits-Remaining') ?? 0),
    limit: Number(res.headers.get('X-Credits-Limit') ?? 0),
  };

  const tokensModel = res.headers.get('X-Tokens-Model');
  const tokens: TokenUsage | undefined = tokensModel ? {
    model: tokensModel,
    inputTokens: Number(res.headers.get('X-Tokens-Input') ?? 0),
    outputTokens: Number(res.headers.get('X-Tokens-Output') ?? 0),
    cachedTokens: Number(res.headers.get('X-Tokens-Cached') ?? 0),
  } : undefined;

  const blob = await res.blob();
  const imageUrl = URL.createObjectURL(blob);

  // Vectorize in the browser using vtracer-webapp (same as visioncortex.org/vtracer)
  onProgress?.('vectorizing');
  try {
    const svg = await vectorizeInBrowser(imageUrl);
    return { svg, credits, tokens };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

/**
 * Load base64 PNG into a canvas, then vectorize with vtracer-webapp (same engine as visioncortex.org/vtracer).
 * The converter reads pixels from a canvas DOM element and writes SVG paths to an SVG DOM element.
 */
async function vectorizeInBrowser(imageUrl: string): Promise<string> {
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

    // Chroma-key approach for transparency (same idea as vtracer CLI commit 16dfb76):
    // 1. Fill canvas with a distinctive key color unlikely to appear in the image
    // 2. Draw the image on top — transparent pixels keep the key color
    // 3. After vectorization, remove all paths whose fill matches the key color
    // This avoids white-blending artifacts on semi-transparent edge pixels.
    const KEY_COLOR = '#FF00FF'; // magenta
    ctx.fillStyle = KEY_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const { ColorImageConverter } = await import('vtracer-webapp');

    const deg2rad = (deg: number) => (deg / 180) * Math.PI;

    // Parameters match the official webapp presets.
    // Note: color_precision is inverted (8 - value), filter_speckle is squared,
    // and angle thresholds are in radians.
    const params = JSON.stringify({
      canvas_id: canvasId,
      svg_id: svgId,
      mode: 'spline',
      clustering_mode: 'color',
      hierarchical: 'stacked',
      filter_speckle: 4 * 4,
      color_precision: 8 - 6,
      layer_difference: 16,
      corner_threshold: deg2rad(60),
      length_threshold: 4.0,
      splice_threshold: deg2rad(45),
      path_precision: 8,
      max_iterations: 10,
    });

    const converter = ColorImageConverter.new_with_string(params);
    converter.init();

    // tick() returns true when conversion is complete
    while (!converter.tick()) {
      // incremental processing — converter writes SVG paths into svgEl
    }

    converter.free();

    // Remove all paths whose fill matches the chroma key color (magenta).
    // Color quantization may shift the exact value, so check with a tolerance.
    const toRemove: Element[] = [];
    for (const child of Array.from(svgEl.children)) {
      if (child.tagName !== 'path') continue;
      const fill = child.getAttribute('style')?.match(/fill:\s*#([0-9a-fA-F]{6})/)?.[1];
      if (!fill) continue;
      const r = parseInt(fill.substring(0, 2), 16);
      const g = parseInt(fill.substring(2, 4), 16);
      const b = parseInt(fill.substring(4, 6), 16);
      // Magenta key: high R, low G, high B
      if (r >= 240 && g <= 15 && b >= 240) {
        toRemove.push(child);
      }
    }
    for (const el of toRemove) svgEl.removeChild(el);

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

function loadImage(src: string): Promise<HTMLImageElement> {
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

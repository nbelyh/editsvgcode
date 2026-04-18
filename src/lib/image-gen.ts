export type ImageProgressStatus = 'generating-image' | 'vectorizing';

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
  pathPrecision: number;     // 1–16
}

export const DEFAULT_VECTORIZER_PARAMS: VectorizerParams = {
  mode: 'spline',
  clusteringMode: 'color',
  hierarchical: 'stacked',
  filterSpeckle: 10,
  colorPrecision: 4,
  layerDifference: 16,
  cornerThreshold: 60,
  lengthThreshold: 4,
  spliceThreshold: 45,
  pathPrecision: 3,
};

import { getAuth } from 'firebase/auth';
import { config } from './config';
import type { CreditsError } from './api-client';

const API_URL = config.API_URL;

/**
 * Generate an SVG from a text prompt.
 * Server generates raster image (binary PNG), client vectorizes with vtracer in browser.
 */
export async function generateImage(
  prompt: string,
  imageModel?: string,
  signal?: AbortSignal,
  onProgress?: (status: ImageProgressStatus) => void,
): Promise<{ svg: string; pngDataUrl: string; credits: { remaining: number; limit: number } }> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  let idToken = await user.getIdToken();

  let res = await fetch(`${API_URL}/api/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ prompt, model: imageModel }),
    signal,
  });

  // If 401 (token revoked/expired), force-refresh and retry once
  if (res.status === 401) {
    idToken = await user.getIdToken(true);
    res = await fetch(`${API_URL}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ prompt, model: imageModel }),
      signal,
    });
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const errData = data as { error?: string; code?: 'INSUFFICIENT_CREDITS' | 'PRO_REQUIRED' | 'UNKNOWN_MODEL'; remaining?: number; limit?: number };
    const error = new Error(errData.error ?? `Request failed (${res.status})`) as CreditsError;
    if (res.status === 402) {
      error.code = 'CREDITS_ERROR';
      error.creditCode = errData.code;
      error.remaining = errData.remaining;
      error.limit = errData.limit;
    }
    throw error;
  }

  const credits = {
    remaining: Number(res.headers.get('X-Credits-Remaining') ?? 0),
    limit: Number(res.headers.get('X-Credits-Limit') ?? 0),
  };

  const blob = await res.blob();

  // Convert to base64 data URL so it persists (not revoked) for preview and re-vectorization
  const pngDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image blob'));
    reader.readAsDataURL(blob);
  });

  // Vectorize in the browser using vtracer-webapp (same as visioncortex.org/vtracer)
  onProgress?.('vectorizing');
  const svg = await vectorize(pngDataUrl);
  return { svg, pngDataUrl, credits };
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

    // GPT-Image with background=transparent makes white subject areas transparent
    // (alpha=0), indistinguishable from the actual background.  Fix: flood-fill
    // from every edge pixel through alpha=0 pixels to find the true background.
    // Any remaining alpha=0 pixel is interior white — fill it with opaque white.
    const preCanvas = document.createElement('canvas');
    preCanvas.width = img.width;
    preCanvas.height = img.height;
    const preCtx = preCanvas.getContext('2d')!;
    preCtx.drawImage(img, 0, 0);
    const imageData = preCtx.getImageData(0, 0, img.width, img.height);
    const { data, width, height } = imageData;

    // Mark which transparent pixels are reachable from the edges (= true background)
    // First, build a barrier mask that closes 1-pixel diagonal gaps in outlines.
    // A pixel is a barrier if it has alpha > 0 OR any 8-neighbor has alpha > 128.
    const barrier = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
      if (data[i * 4 + 3] > 0) {
        barrier[i] = 1;
        continue;
      }
      const x = i % width;
      const y = (i - x) / width;
      outer:
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (data[(ny * width + nx) * 4 + 3] > 128) {
              barrier[i] = 1;
              break outer;
            }
          }
        }
      }
    }

    const isBackground = new Uint8Array(width * height);
    const queue: number[] = [];

    // Seed: all edge pixels that are not barriers
    for (let x = 0; x < width; x++) {
      for (const y of [0, height - 1]) {
        const idx = y * width + x;
        if (!barrier[idx] && !isBackground[idx]) {
          isBackground[idx] = 1;
          queue.push(idx);
        }
      }
    }
    for (let y = 0; y < height; y++) {
      for (const x of [0, width - 1]) {
        const idx = y * width + x;
        if (!barrier[idx] && !isBackground[idx]) {
          isBackground[idx] = 1;
          queue.push(idx);
        }
      }
    }

    // BFS: spread through non-barrier neighbors only
    let head = 0;
    while (head < queue.length) {
      const idx = queue[head++];
      const x = idx % width;
      const y = (idx - x) / width;
      const neighbors = [
        y > 0 ? idx - width : -1,
        y < height - 1 ? idx + width : -1,
        x > 0 ? idx - 1 : -1,
        x < width - 1 ? idx + 1 : -1,
      ];
      for (const n of neighbors) {
        if (n >= 0 && !isBackground[n] && !barrier[n]) {
          isBackground[n] = 1;
          queue.push(n);
        }
      }
    }

    // Any alpha=0 pixel NOT reached by flood fill is interior white — make it opaque white
    for (let i = 0; i < width * height; i++) {
      if (data[i * 4 + 3] === 0 && !isBackground[i]) {
        data[i * 4] = 255;     // R
        data[i * 4 + 1] = 255; // G
        data[i * 4 + 2] = 255; // B
        data[i * 4 + 3] = 255; // A
      }
    }
    preCtx.putImageData(imageData, 0, 0);

    // Chroma-key approach for transparency (same idea as vtracer CLI commit 16dfb76):
    // 1. Fill canvas with a distinctive key color unlikely to appear in the image
    // 2. Draw the preprocessed image on top — only true background pixels stay key color
    // 3. After vectorization, remove all paths whose fill matches the key color
    const KEY_COLOR = '#FF00FF'; // magenta
    ctx.fillStyle = KEY_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(preCanvas, 0, 0);

    const { ColorImageConverter } = await import('vtracer-webapp');

    const deg2rad = (deg: number) => (deg / 180) * Math.PI;

    // Parameters match the official webapp presets.
    // Note: color_precision is inverted (8 - value), filter_speckle is squared,
    // and angle thresholds are in radians.
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

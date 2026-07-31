/**
 * Render an SVG string to a small PNG data URL, for sending a drawing to a
 * vision model.
 *
 * Markup is a poor description of a picture: traced artwork is tens of
 * thousands of characters of path coordinates, and any budget that fits in a
 * prompt covers only its first fraction. A thumbnail of what the drawing
 * actually looks like is both more accurate and cheaper.
 */

/** Big enough to recognise a subject, small enough to stay a cheap image input. */
const DEFAULT_MAX_PX = 512;

/**
 * Returns a `data:image/png;base64,…` URL, or null when the drawing cannot be
 * rasterised — a canvas tainted by an external reference, an SVG the browser
 * refuses to parse, or a document with no intrinsic size. Callers treat null as
 * "no picture available" and fall back to text.
 */
export async function rasterizeSvg(svg: string, maxPx = DEFAULT_MAX_PX): Promise<string | null> {
  if (!svg.includes('<svg')) return null;

  // Base64 rather than encodeURIComponent: SVG is full of characters that would
  // otherwise need escaping, and unicode content breaks a naive escape.
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  const src = `data:image/svg+xml;base64,${encoded}`;

  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    const el = new Image();
    // Belt and braces: a drawing referencing an external image would taint the
    // canvas and make toDataURL throw, which the catch below turns into null.
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = () => resolve(null);
    el.src = src;
  });
  if (!img) return null;

  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h) return null;

  const scale = Math.min(1, maxPx / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  // Transparent SVGs would otherwise reach the model as black on black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  try {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

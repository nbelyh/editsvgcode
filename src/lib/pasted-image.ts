/**
 * A picture attached to the chat — pasted, dropped, or picked with the attach button.
 *
 * People paste screenshots and logos into the chat box expecting something to happen, and
 * nothing did: a textarea drops an image paste on the floor. Now the picture is attached to the
 * message. Sent with words, it goes to the model with them. Sent alone, the chat asks what to
 * do with it: trace it to SVG in the browser — the vectorizer that traces generated images, no
 * model call, no credit — or have the model redraw it as clean SVG.
 */

import { loadImage } from './image-gen';

/** The tool names the proposals of the picture card's own actions are stored under — traced
 *  in the browser, or redrawn by the image model with no chat model involved. Never sent to the
 *  model. */
export const TRACE_IMAGE_TOOL = 'trace_image';
export const REDRAW_IMAGE_TOOL = 'redraw_image';

/** Tools whose proposal carries the picture its SVG was traced from, and the sliders to retrace it. */
export function isPictureTool(name: string): boolean {
  return name === 'generate_image' || name === 'modify_image' || isPictureActionTool(name);
}

/** A proposal made by a button on the picture card rather than by the chat model. */
export function isPictureActionTool(name: string): boolean {
  return name === TRACE_IMAGE_TOOL || name === REDRAW_IMAGE_TOOL;
}

/** The picture card's buttons: trace the picture, or have the image model redraw it. */
export type PictureCardAction = 'trace' | 'illustrate';

/**
 * The picture in a paste or a drop — a raster image or an SVG file — or null.
 *
 * A paste that carries text is left to paste as text: Word and Excel put a picture of the
 * copied selection on the clipboard next to the text, and that paste is the text. A drop has
 * no such twin, so a dropped picture is taken whatever else comes with it.
 */
export function pictureFileFrom(data: DataTransfer | null, kind: 'paste' | 'drop'): File | null {
  if (!data) return null;
  if (kind === 'paste' && data.getData('text/plain').trim()) return null;
  for (const file of Array.from(data.files ?? [])) {
    if (isPictureType(file.type)) return file;
  }
  // Some browsers put a pasted image only in `items`, leaving `files` empty.
  for (const item of Array.from(data.items ?? [])) {
    if (item.kind === 'file' && isPictureType(item.type)) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}

function isPictureType(type: string): boolean {
  return type.startsWith('image/');
}

/** An SVG file is opened like pasted SVG code, not traced or sent as a picture. */
export function isSvgFile(file: File): boolean {
  return file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
}

/**
 * The size a picture is traced at. The vectorizer's defaults are tuned for the 1024-pixel
 * images the generator makes: a photo many times that size takes long to trace and comes back
 * as an SVG too heavy to edit, and a small icon loses its detail to the speckle filter, which
 * removes blobs of a fixed pixel area. So the longest side is brought to between 512 and 1024.
 */
export function traceSize(width: number, height: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  const scale = longest > MAX_SIDE ? MAX_SIDE / longest : longest < MIN_SIDE ? MIN_SIDE / longest : 1;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

const MAX_SIDE = 1024;
const MIN_SIDE = 512;

/**
 * The picture as a PNG data URL at the size it is traced at, which is also a fair size to show
 * the model. PNG whatever it came in as: the chat stores pictures as PNG, and transparency,
 * which the vectorizer keys out, survives it.
 */
export async function rasterToPngDataUrl(file: Blob): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    if (!img.naturalWidth || !img.naturalHeight) throw new Error('Image has no size');
    const { width, height } = traceSize(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * The picture as the model is shown it: on white, if any of it is transparent. Vision models
 * read a transparent background as black, and asked to redraw a logo on one, drew it a black
 * rectangle to sit on. White is the page the drawing will most likely sit on, and the model is
 * told that white may be no background at all. The original, transparency kept, is what is
 * traced and what an image edit starts from.
 */
export async function pictureForModel(picture: string): Promise<string> {
  const img = await loadImage(picture);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let transparent = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) { transparent = true; break; }
  }
  if (!transparent) return picture;
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

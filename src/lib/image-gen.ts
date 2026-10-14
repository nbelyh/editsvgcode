export type ImageProgressStatus = 'generating-image' | 'modifying-image' | 'vectorizing';

import { getAuth } from 'firebase/auth';
import type { ImageStyle } from './models';
import { config } from './config';
import type { CreditsError } from './api-client';
import { traceToFit, type VectorizerParams } from './trace';

export * from './trace';

const API_URL = config.API_URL;

/** The style as the image endpoints take it: the two fields by name, nothing else of the type. */
function styleFields(style?: ImageStyle): { outlines?: boolean; detail?: boolean } {
  return style ? { outlines: style.outlines, detail: style.detail } : {};
}

/**
 * Generate an SVG from a text prompt.
 * Server generates raster image (binary PNG), client vectorizes with vtracer in browser.
 */
export async function generateImage(
  prompt: string,
  imageModel?: string,
  signal?: AbortSignal,
  onProgress?: (status: ImageProgressStatus) => void,
  style?: ImageStyle,
): Promise<{ svg: string; pngDataUrl: string; params: VectorizerParams; credits: { remaining: number; limit: number } }> {
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
    body: JSON.stringify({ prompt, model: imageModel, ...styleFields(style) }),
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
      body: JSON.stringify({ prompt, model: imageModel, ...styleFields(style) }),
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
  const { svg, params } = await traceToFit(pngDataUrl);
  return { svg, pngDataUrl, params, credits };
}

/**
 * Modify an existing generated image using AI image editing.
 * Sends current PNG + modification prompt to the server, re-vectorizes the result.
 */
export async function modifyImage(
  prompt: string,
  sourcePngDataUrl: string,
  imageModel?: string,
  signal?: AbortSignal,
  onProgress?: (status: ImageProgressStatus) => void,
  style?: ImageStyle,
): Promise<{ svg: string; pngDataUrl: string; params: VectorizerParams; credits: { remaining: number; limit: number } }> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  // Extract raw base64 from data URL (strip "data:image/png;base64," prefix)
  const base64 = sourcePngDataUrl.replace(/^data:image\/\w+;base64,/, '');

  let idToken = await user.getIdToken();

  let res = await fetch(`${API_URL}/api/modify-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ prompt, image: base64, model: imageModel, ...styleFields(style) }),
    signal,
  });

  // If 401 (token revoked/expired), force-refresh and retry once
  if (res.status === 401) {
    idToken = await user.getIdToken(true);
    res = await fetch(`${API_URL}/api/modify-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ prompt, image: base64, model: imageModel, ...styleFields(style) }),
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

  // Vectorize in the browser
  onProgress?.('vectorizing');
  const { svg, params } = await traceToFit(pngDataUrl);
  return { svg, pngDataUrl, params, credits };
}


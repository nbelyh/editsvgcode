import type { GalleryMeta } from './firebase';

/**
 * Heuristic prefill for the publish dialog — no AI involved. The best signal
 * is the user's own first chat prompt ("draw a cat riding a bicycle"); for
 * files without a chat we fall back to the SVG <title> element, then the
 * uploaded file's name. The user reviews/edits the result before publishing.
 *
 * Runtime firebase/chat imports stay inside suggestGalleryMetaForFile (dynamic)
 * so the pure heuristic is unit-testable without firebase.ts side effects.
 */

const TITLE_MAX_WORDS = 6;
const TITLE_MAX_CHARS = 50;
const DESCRIPTION_MAX_CHARS = 200;

/** Leading imperative filler that makes a poor title ("draw me a …"). */
const PROMPT_FILLER = /^(?:please\s+)?(?:can\s+you\s+|could\s+you\s+|i\s+(?:want|need)\s+(?:you\s+to\s+)?)?(?:please\s+)?(?:draw|create|make|generate|design|paint|sketch|render)\s*(?:me\s+)?(?:a|an|the)?\s+/i;

function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut) + '…';
}

function titleFromPrompt(prompt: string): string {
  const stripped = collapse(prompt.replace(PROMPT_FILLER, ''));
  if (!stripped) return '';
  const words = stripped.split(' ').slice(0, TITLE_MAX_WORDS).join(' ');
  const trimmed = truncateAtWord(words, TITLE_MAX_CHARS).replace(/[.,;:!?]+…?$/, '');
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function titleFromSvg(svg: string): string {
  try {
    const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml');
    if (parsed.querySelector('parsererror')) return '';
    const title = parsed.querySelector('svg > title') ?? parsed.querySelector('title');
    return collapse(title?.textContent ?? '');
  } catch {
    return '';
  }
}

/**
 * Shorten an author name for public display: "Nikolay Belykh" -> "Nikolay B.".
 * Publishing should not put someone's full legal-looking name on a card that
 * anyone can find; the given name plus an initial still identifies the author
 * to people who know them, without broadcasting the surname.
 *
 * Single-word names are left alone (nothing to abbreviate), and any middle
 * parts are dropped rather than initialised, so "Ada King Lovelace" reads
 * "Ada L." — the last part is the one people treat as the surname.
 */
export function displayAuthorName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] ?? '';
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last[0].toUpperCase()}.`;
}

export function suggestGalleryMeta(opts: { svg?: string; firstPrompt?: string; fileName?: string }): GalleryMeta {
  const prompt = collapse(opts.firstPrompt ?? '');
  if (prompt) {
    return {
      title: titleFromPrompt(prompt),
      description: truncateAtWord(prompt, DESCRIPTION_MAX_CHARS),
    };
  }
  const svgTitle = opts.svg ? titleFromSvg(opts.svg) : '';
  if (svgTitle) {
    return { title: truncateAtWord(svgTitle, TITLE_MAX_CHARS), description: '' };
  }
  const fileName = collapse(opts.fileName ?? '');
  if (fileName) {
    return { title: truncateAtWord(fileName, TITLE_MAX_CHARS), description: '' };
  }
  return { title: '', description: '' };
}

/** Suggestion for a stored document: reads the first user chat prompt, if any. */
export async function suggestGalleryMetaForFile(fileId: string, svg: string, fileName?: string): Promise<GalleryMeta> {
  let firstPrompt: string | undefined;
  try {
    const { loadFirstUserPrompt } = await import('./chat-history');
    firstPrompt = (await loadFirstUserPrompt(fileId)) ?? undefined;
  } catch {
    // No chat or no access — cosmetic only, the fallbacks below still apply.
  }
  return suggestGalleryMeta({ svg, firstPrompt, fileName });
}

/**
 * Embedded data — base64 images and fonts inside an SVG — kept out of what the model reads, and
 * put back into what it writes.
 *
 * A photo embedded as a data: URI is megabytes of base64 on a single line. Sent to the model it
 * buys nothing, since the model cannot see the picture in it, and it overflowed the context
 * window as soon as a search or a line read happened to include that line — and a search for
 * almost anything matches random base64. So the model is shown a short token in its place, named
 * by a hash of the data. Wherever the model writes a token back — a rewritten line, a whole new
 * document, inserted markup — the data it stands for is put back before the edit is applied, and
 * the document never loses a byte.
 *
 * Only data long enough to matter is replaced, and a data URI never spans a newline, so the line
 * numbers in what the model reads are the document's own.
 */

/** Data URIs shorter than this are left as they are: a tiny icon costs less than a token. */
const MIN_CHARS = 512;

const DATA_URI = /data:([a-z]+\/[\w.+-]+)?((?:;[\w.+-]+=[\w.+-]*)*);base64,[A-Za-z0-9+/]+=*/gi;
const TOKEN = /⟦embedded [^⟧\n]*?#([0-9a-f]{8})⟧/gi;
/** Anything left that still looks like a token once the resolvable ones are replaced. */
const LEFTOVER = /⟦embedded[^⟧\n]*⟧?/g;

/** FNV-1a: stable for the same data across turns and sessions, which a position is not. */
function hashOf(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function sizeLabel(chars: number): string {
  const bytes = Math.round(chars * 0.75);
  return bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** The token the model is shown for one embedded data URI. */
export function embeddedToken(uri: string): string {
  const mime = /^data:([^;,]+)/i.exec(uri)?.[1] ?? 'data';
  return `⟦embedded ${mime} ${sizeLabel(uri.length)} #${hashOf(uri)}⟧`;
}

/** The document as the model reads it: every long embedded data URI replaced by its token. */
export function elideEmbeddedData(svg: string): string {
  return svg.replace(DATA_URI, (uri) => (uri.length >= MIN_CHARS ? embeddedToken(uri) : uri));
}

/**
 * Put embedded data back into text the model wrote, from the document it was shown. Tokens are
 * matched by their hash alone, so a label the model paraphrased still resolves. A token the
 * document does not hold — mistyped, or left over from a document that has since changed — is
 * reported rather than written, since writing it would put a label where an image was.
 */
export function restoreEmbeddedData(text: string, source: string): { text: string; unknown: string[] } {
  if (!text.includes('⟦embedded')) return { text, unknown: [] };
  const byHash = new Map<string, string>();
  for (const match of source.matchAll(DATA_URI)) {
    if (match[0].length >= MIN_CHARS) byHash.set(hashOf(match[0]), match[0]);
  }
  const restored = text.replace(TOKEN, (token, hash: string) => byHash.get(hash.toLowerCase()) ?? token);
  // Whatever still reads "⟦embedded" was not restored: an id the document does not hold, or a
  // token garbled past recognition — a digit dropped, the "#" lost. Either way it is reported,
  // never written.
  return { text: restored, unknown: restored.match(LEFTOVER) ?? [] };
}

/** restoreEmbeddedData through every string in a tool call's arguments. */
export function restoreEmbeddedArgs<T>(args: T, source: string): { args: T; unknown: string[] } {
  const unknown: string[] = [];
  const walk = (value: unknown): unknown => {
    if (typeof value === 'string') {
      const restored = restoreEmbeddedData(value, source);
      unknown.push(...restored.unknown);
      return restored.text;
    }
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, walk(inner)]));
    }
    return value;
  };
  return { args: walk(args) as T, unknown };
}

/** What the model is told when an edit names embedded data the document does not hold. */
export function unknownEmbeddedRefusal(tokens: string[]): string {
  const named = [...new Set(tokens)].slice(0, 3).join(', ');
  return `Not executed: it refers to embedded data the document does not hold (${named}). Copy each ⟦embedded … #id⟧ token exactly as the document shows it.`;
}

/** Said alongside any document the model reads with tokens in it. */
export const EMBEDDED_NOTE =
  ' Embedded data — images, fonts — is shown as ⟦embedded … #id⟧ tokens; the document holds the'
  + ' full data. Wherever you rewrite markup that contains one (replace_lines, replace_svg,'
  + ' insert_element), copy the token exactly as shown and the data is put back. Never write a'
  + ' data: URI of your own in its place, and know that leaving a token out removes what it stands for.'
  + ' A token does not show what an embedded image depicts.';

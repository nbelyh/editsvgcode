/**
 * What a chat turn started from, for the analytics and failure records of AI edits.
 *
 * Rejects pile up on the starter drawing — the sample rectangles a new visitor sees — and it
 * could only be guessed from the size of a stored document. Saying it outright lets the accept
 * and reject rates for "first request on the starter" be read instead of inferred.
 */

import DEFAULT_SVG from '../assets/default.svg?raw';

export type DocOrigin = 'starter' | 'empty' | 'own';

const comparable = (svg: string) => svg.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
const STARTER = comparable(DEFAULT_SVG);
const DRAWN = /<(path|rect|circle|ellipse|line|polyline|polygon|text|image|use)\b/i;

export function docOrigin(svg: string): DocOrigin {
  if (comparable(svg) === STARTER) return 'starter';
  if (!DRAWN.test(svg)) return 'empty';
  return 'own';
}

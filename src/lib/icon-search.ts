/**
 * Client-side Iconify API integration for the search_icons tool.
 * Searches the public Iconify API and fetches SVG content for top matches.
 */

import { docOrigin } from './doc-origin';

const ICONIFY_API = 'https://api.iconify.design';
const MAX_RESULTS = 30;
/**
 * The icons shown come from at most this many sets, because each set is one download. Fetched one
 * icon at a time, a search cost 31 requests, and two or three searches were enough for the API to
 * refuse every download for minutes (HTTP 429) — the model, told the icons failed, drew a fake.
 */
const MAX_SETS = 8;

/** Preferred icon sets by style — high-quality, permissively licensed sets first. */
const OUTLINE_PREFIXES = 'tabler,lucide,ph,heroicons,material-symbols';
const FILLED_PREFIXES = 'mdi,fa6-solid,material-symbols,ph,fluent';
const COLORED_PREFIXES = 'noto,fluent-emoji,fluent-emoji-flat,twemoji,openmoji,icon-park,emojione';

/** Licenses that require no attribution (permissive). */
const NO_ATTRIBUTION_SPDX = new Set(['MIT', 'Apache-2.0', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Unlicense', 'CC0-1.0']);

interface IconifyCollectionInfo {
  name: string;
  license: { title: string; spdx?: string; url?: string };
  author?: { name?: string; url?: string };
  palette?: boolean;
}

interface IconifySearchResponse {
  icons: string[];   // e.g. ["mdi:home", "ph:house-bold"]
  total: number;
  collections: Record<string, IconifyCollectionInfo>;
}

interface IconifyIconData {
  body: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  rotate?: number;
  hFlip?: boolean;
  vFlip?: boolean;
}

/** What /{prefix}.json?icons=… returns: the asked-for icons, and the parents of any aliases among them. */
interface IconifyIconSet {
  icons: Record<string, IconifyIconData>;
  aliases?: Record<string, Partial<IconifyIconData> & { parent: string }>;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

/**
 * One icon's SVG, drawn as the API's own /{prefix}/{name}.svg?height=auto draws it: at the
 * icon's own size. Null when it is missing, or rotated or flipped, which the sets searched hardly
 * ever do and which is not worth drawing here.
 */
export function svgOf(set: IconifyIconSet, name: string): string | null {
  let icon = set.icons[name];
  let size: Partial<IconifyIconData> = {};
  // An alias names its parent, perhaps through further aliases, and may give its own size.
  for (let hops = 0; !icon && hops < 5; hops++) {
    const alias = set.aliases?.[name];
    if (!alias || alias.rotate || alias.hFlip || alias.vFlip) return null;
    size = { left: alias.left, top: alias.top, width: alias.width, height: alias.height, ...strip(size) };
    name = alias.parent;
    icon = set.icons[name];
  }
  if (!icon || icon.rotate || icon.hFlip || icon.vFlip) return null;
  const left = size.left ?? icon.left ?? set.left ?? 0;
  const top = size.top ?? icon.top ?? set.top ?? 0;
  const width = size.width ?? icon.width ?? set.width ?? 16;
  const height = size.height ?? icon.height ?? set.height ?? 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${left} ${top} ${width} ${height}">${icon.body}</svg>`;
}

/** The fields that are set, so a nearer alias's size is not overwritten by a farther one's gap. */
function strip(size: Partial<IconifyIconData>): Partial<IconifyIconData> {
  return Object.fromEntries(Object.entries(size).filter(([, v]) => v !== undefined));
}

export interface IconResult {
  name: string;
  svg: string;
  setName: string;
  license: string;
  licenseUrl?: string;
  needsAttribution: boolean;
}

/** The icon ids a search leaves after the palette, licence and "already shown" filters. */
async function searchCandidates(
  query: string,
  prefixes: string | undefined,
  palette: 'colored' | 'monochrome' | 'any',
  noAttribution: boolean,
  excludeNames: string[],
  signal?: AbortSignal,
): Promise<{ candidates: string[]; collections: IconifySearchResponse['collections'] } | { error: string; failed?: boolean }> {
  const params = new URLSearchParams({ query, limit: '999' });
  if (prefixes) params.set('prefixes', prefixes);

  // NOTE: category is filtered client-side — the Iconify API category param is unreliable

  const searchRes = await fetch(`${ICONIFY_API}/search?${params}`, { signal });
  if (!searchRes.ok) {
    return { error: `Icon search failed (HTTP ${searchRes.status}). Try a different query or use manual SVG.`, failed: true };
  }

  const data: IconifySearchResponse = await searchRes.json();
  if (data.icons.length === 0) {
    return { error: `No icons found for "${query}". Try a different keyword or use generate_image for custom illustrations.` };
  }

  let candidates = data.icons;

  // Filter by palette (client-side, using collection metadata)
  if (palette === 'monochrome') {
    candidates = candidates.filter(iconId => {
      const prefix = iconId.split(':')[0];
      return data.collections[prefix]?.palette !== true;
    });
  } else if (palette === 'colored') {
    candidates = candidates.filter(iconId => {
      const prefix = iconId.split(':')[0];
      return data.collections[prefix]?.palette === true;
    });
  }

  if (candidates.length === 0) {
    return { error: `No ${palette} icons found for "${query}". Try palette='any' or a different query.` };
  }

  if (noAttribution) {
    candidates = candidates.filter(iconId => {
      const prefix = iconId.split(':')[0];
      const col = data.collections[prefix];
      return col?.license?.spdx && NO_ATTRIBUTION_SPDX.has(col.license.spdx);
    });
    if (candidates.length === 0) {
      return { error: `No attribution-free icons found for "${query}". Try searching with noAttribution=false, or use generate_image.` };
    }
  }

  // Exclude already-shown icons (for "More" pagination)
  if (excludeNames.length > 0) {
    const excludeSet = new Set(excludeNames);
    candidates = candidates.filter(id => !excludeSet.has(id));
    if (candidates.length === 0) {
      return { error: `No more icons available for "${query}". Try a different query or use generate_image.` };
    }
  }

  return { candidates, collections: data.collections };
}

/**
 * Fetch icons from Iconify and return structured results.
 * The caller (agentic loop) shows these to the user for selection.
 */
export async function fetchIcons(
  query: string,
  style: 'outline' | 'filled' | 'any',
  noAttribution: boolean,
  palette: 'colored' | 'monochrome' | 'any' = 'any',
  signal?: AbortSignal,
  excludeNames: string[] = [],
): Promise<{ icons: IconResult[]; error?: string }> {
  // Palette=colored overrides style prefixes — colored sets are specific
  const prefixes = palette === 'colored' ? COLORED_PREFIXES
    : style === 'outline' ? OUTLINE_PREFIXES
    : style === 'filled' ? FILLED_PREFIXES
    : undefined;

  // A style narrows the search to a handful of sets, which hold only the best-known brands: asked
  // for a brand logo in the filled style, the search found nothing although Simple Icons has it,
  // and the model went on to generate a look-alike of a real brand's logo. So a style is a
  // preference — when it leaves nothing, the search runs again across every set.
  let found = await searchCandidates(query, prefixes, palette, noAttribution, excludeNames, signal);
  if ('error' in found && prefixes && !found.failed) {
    const wider = await searchCandidates(query, undefined, palette, noAttribution, excludeNames, signal);
    if (!('error' in wider)) found = wider;
  }
  if ('error' in found) return { icons: [], error: found.error };
  const { candidates, collections } = found;

  const selected = pickDiverseIcons(candidates, MAX_RESULTS, MAX_SETS);

  // One download per set, for all of that set's icons at once.
  const namesBySet = new Map<string, string[]>();
  for (const id of selected) {
    const [prefix, name] = id.split(':');
    namesBySet.set(prefix, [...(namesBySet.get(prefix) ?? []), name]);
  }
  const sets = new Map<string, IconifyIconSet>();
  await Promise.all([...namesBySet].map(async ([prefix, names]) => {
    try {
      const res = await fetch(`${ICONIFY_API}/${prefix}.json?icons=${names.map(encodeURIComponent).join(',')}`, { signal });
      if (res.ok) sets.set(prefix, await res.json());
    } catch { /* that set's icons are left out */ }
  }));

  const icons = selected.flatMap((id): IconResult[] => {
    const [prefix, name] = id.split(':');
    const set = sets.get(prefix);
    const svg = set && svgOf(set, name);
    if (!svg) return [];
    const col = collections[prefix];
    return [{
      name: id,
      svg,
      setName: col?.name ?? prefix,
      license: col?.license?.title ?? 'Unknown',
      licenseUrl: col?.license?.url ?? col?.author?.url,
      needsAttribution: !NO_ATTRIBUTION_SPDX.has(col?.license?.spdx ?? ''),
    }];
  });
  if (icons.length === 0) {
    return { icons: [], error: 'Found icons but could not download them; the icon service may be busy. Try search_icons once more. If it fails again, tell the user the icon library is unavailable right now rather than drawing a look-alike of a brand\'s logo.' };
  }

  return { icons };
}

/** An SVG's size in its own units: the viewBox, else width and height; null when it has neither. */
function sizeOf(svg: string): { x: number; y: number; width: number; height: number } | null {
  const root = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
  if (root.tagName.toLowerCase() !== 'svg') return null;
  const vb = (root.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) return { x: vb[0], y: vb[1], width: vb[2], height: vb[3] };
  const width = parseFloat(root.getAttribute('width') ?? ''), height = parseFloat(root.getAttribute('height') ?? '');
  return width > 0 && height > 0 ? { x: 0, y: 0, width, height } : null;
}

const round = (n: number) => Number(n.toPrecision(3));
const box = (x: number, y: number, size: number) => `x="${round(x)}" y="${round(y)}" width="${round(size)}" height="${round(size)}"`;

/**
 * The picked icon, ready to insert, and where it can go.
 *
 * Asked to place the icon with a transform, models got the arithmetic wrong in half the runs —
 * a heart 34 units across where 100 was meant, a rocket 83 wide in a 64-unit box — even when
 * handed the numbers. So the icon keeps its own <svg> tag: given x, y, width and height, an
 * inner <svg> scales its viewBox into that box by itself, and the model only picks the box, in
 * the drawing's own units. It goes in last, since an icon put first inside a group was painted
 * under the group's box and could not be seen.
 */
export function formatIconForModel(icon: IconResult, svgCode = ''): string {
  const licenseNote = icon.needsAttribution
    ? ` — ⚠️ requires attribution (${icon.licenseUrl ?? icon.license})`
    : '';
  const head = `User selected icon: ${icon.name} — ${icon.setName} (${icon.license})${licenseNote}`;
  const attribution = icon.needsAttribution ? ' The icon requires attribution: mention it to the user with the license link.' : '';
  const parts = /^<svg\b[^>]*\bviewBox="([^"]*)"[^>]*>([\s\S]*)<\/svg>$/.exec(icon.svg.trim());
  const doc = svgCode ? sizeOf(svgCode) : null;
  if (!parts || !doc) {
    return `${head}\n\`\`\`svg\n${icon.svg}\n\`\`\`\n\nInsert this icon with insert_element, or make it the whole drawing with replace_svg when the user asked for the icon itself. Size it to read clearly: about a quarter of the drawing's shorter side.${attribution}`;
  }

  const [, viewBox, body] = parts;
  const short = Math.min(doc.width, doc.height);
  const size = short / 4, margin = short / 25;
  const left = doc.x + margin, right = doc.x + doc.width - margin - size;
  const top = doc.y + margin, bottom = doc.y + doc.height - margin - size;
  const centre = box(doc.x + (doc.width - size) / 2, doc.y + (doc.height - size) / 2, size);
  // On the starter or an empty canvas the icon IS the drawing, so the box it comes in fills the
  // canvas: weak models keep the box they are handed, and a centred quarter-size icon on an
  // otherwise empty page read as a failure.
  // The text sizes in the drawing, from attributes and style rules alike, so "as tall as the text"
  // comes with a number: a bell beside an 18 px title came out 9 units tall.
  const fontSizes = [...new Set([...svgCode.matchAll(/font-size\s*[:=]\s*["']?\s*([\d.]+)/g)].map((m) => Number(m[1])))]
    .filter((n) => n > 0).sort((a, b) => a - b).slice(0, 6);
  const origin = docOrigin(svgCode);
  const whole = box(doc.x + margin, doc.y + margin, short - 2 * margin);
  const fresh = origin === 'starter' ? 'The drawing is still the untouched starter sample, so unless the user asked to add to it, the icon replaces it: replace_svg with a document holding only this tag, as it is.\n'
    : origin === 'empty' ? 'The drawing is empty, so the icon is the drawing: insert it as it is.\n' : '';

  return `${head}

Ready to insert. Keep this <svg> tag and change only x, y, width and height: they are the box the icon fills, in the drawing's units, and it scales itself — no transform. color="…" on the tag recolours it.
\`\`\`svg
<svg ${fresh ? whole : centre} viewBox="${viewBox}" color="currentColor">${body}</svg>
\`\`\`
${fresh}- Added to the drawing (${round(doc.width)}×${round(doc.height)}): insert_element with position "last-child" — on the root <svg>, or on a group — never "first-child", which is painted underneath everything after it. Unless the user gave a size, about a quarter of the drawing: top left ${box(left, top, size)}; top right ${box(right, top, size)}; bottom left ${box(left, bottom, size)}; bottom right ${box(right, bottom, size)}; centre ${centre}. Beside text, make the box as tall as the text${fontSizes.length ? ` (font sizes here: ${fontSizes.join(', ')})` : ''}. Inside a shape, at most half the shape's height, and within it.
- As the whole drawing: ${whole}.${attribution}`;
}

/**
 * Pick diverse icons: prefer one per icon set prefix, then fill remaining — from the first
 * `maxSets` sets only.
 */
function pickDiverseIcons(all: string[], max: number, maxSets: number): string[] {
  const kept = new Set([...new Set(all.map((icon) => icon.split(':')[0]))].slice(0, maxSets));
  const icons = all.filter((icon) => kept.has(icon.split(':')[0]));
  const seen = new Set<string>();
  const result: string[] = [];

  // First pass: one per prefix
  for (const icon of icons) {
    if (result.length >= max) break;
    const prefix = icon.split(':')[0];
    if (!seen.has(prefix)) {
      seen.add(prefix);
      result.push(icon);
    }
  }

  // Second pass: fill remaining
  for (const icon of icons) {
    if (result.length >= max) break;
    if (!result.includes(icon)) {
      result.push(icon);
    }
  }

  return result;
}

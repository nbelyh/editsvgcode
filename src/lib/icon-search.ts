/**
 * Client-side Iconify API integration for the search_icons tool.
 * Searches the public Iconify API and fetches SVG content for top matches.
 */

const ICONIFY_API = 'https://api.iconify.design';
const MAX_RESULTS = 30;

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

export interface IconResult {
  name: string;
  svg: string;
  setName: string;
  license: string;
  licenseUrl?: string;
  needsAttribution: boolean;
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
  const params = new URLSearchParams({ query, limit: '999' });

  // Palette=colored overrides style prefixes — colored sets are specific
  if (palette === 'colored') {
    params.set('prefixes', COLORED_PREFIXES);
  } else if (style === 'outline') {
    params.set('prefixes', OUTLINE_PREFIXES);
  } else if (style === 'filled') {
    params.set('prefixes', FILLED_PREFIXES);
  }

  // NOTE: category is filtered client-side — the Iconify API category param is unreliable

  const searchRes = await fetch(`${ICONIFY_API}/search?${params}`, { signal });
  if (!searchRes.ok) {
    return { icons: [], error: `Icon search failed (HTTP ${searchRes.status}). Try a different query or use manual SVG.` };
  }

  const data: IconifySearchResponse = await searchRes.json();
  if (data.icons.length === 0) {
    return { icons: [], error: `No icons found for "${query}". Try a different keyword or use generate_image for custom illustrations.` };
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
    return { icons: [], error: `No ${palette} icons found for "${query}". Try palette='any' or a different query.` };
  }

  if (noAttribution) {
    candidates = candidates.filter(iconId => {
      const prefix = iconId.split(':')[0];
      const col = data.collections[prefix];
      return col?.license?.spdx && NO_ATTRIBUTION_SPDX.has(col.license.spdx);
    });
    if (candidates.length === 0) {
      return { icons: [], error: `No attribution-free icons found for "${query}". Try searching with noAttribution=false, or use generate_image.` };
    }
  }

  // Exclude already-shown icons (for "More" pagination)
  if (excludeNames.length > 0) {
    const excludeSet = new Set(excludeNames);
    candidates = candidates.filter(id => !excludeSet.has(id));
    if (candidates.length === 0) {
      return { icons: [], error: `No more icons available for "${query}". Try a different query or use generate_image.` };
    }
  }

  const selected = pickDiverseIcons(candidates, MAX_RESULTS);

  const results = await Promise.all(
    selected.map(async (iconId): Promise<IconResult | null> => {
      try {
        const [prefix, name] = iconId.split(':');
        const col = data.collections[prefix];
        const spdx = col?.license?.spdx ?? '';
        const svgRes = await fetch(
          `${ICONIFY_API}/${prefix}/${name}.svg?height=auto`,
          { signal },
        );
        if (!svgRes.ok) return null;
        const svg = await svgRes.text();
        return {
          name: iconId,
          svg,
          setName: col?.name ?? prefix,
          license: col?.license?.title ?? 'Unknown',
          licenseUrl: col?.license?.url ?? col?.author?.url,
          needsAttribution: !NO_ATTRIBUTION_SPDX.has(spdx),
        };
      } catch {
        return null;
      }
    }),
  );

  const icons = results.filter((r): r is IconResult => r !== null);
  if (icons.length === 0) {
    return { icons: [], error: 'Found icon names but failed to fetch SVG. Try again or use generate_image.' };
  }

  return { icons };
}

/**
 * Format a single selected icon for the model to use.
 */
export function formatIconForModel(icon: IconResult): string {
  const licenseNote = icon.needsAttribution
    ? ` — ⚠️ requires attribution (${icon.licenseUrl ?? icon.license})`
    : '';
  return `User selected icon: ${icon.name} — ${icon.setName} (${icon.license})${licenseNote}\n\`\`\`svg\n${icon.svg}\n\`\`\`\n\nInsert this icon into the SVG using replace_lines or replace_svg. Adjust position, size (width/height or transform), and colors (fill/stroke) to fit the document. If the icon requires attribution, mention it to the user with the license link.`;
}

/**
 * Pick diverse icons: prefer one per icon set prefix, then fill remaining.
 */
function pickDiverseIcons(icons: string[], max: number): string[] {
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

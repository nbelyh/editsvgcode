/**
 * Client-side Iconify API integration for the search_icons tool.
 * Searches the public Iconify API and fetches SVG content for top matches.
 */

const ICONIFY_API = 'https://api.iconify.design';
const MAX_RESULTS = 5;

/** Preferred icon sets by style — high-quality, permissively licensed sets first. */
const OUTLINE_PREFIXES = 'tabler,lucide,ph,heroicons,material-symbols';
const FILLED_PREFIXES = 'mdi,fa6-solid,material-symbols,ph,fluent';

/** Licenses that require no attribution (permissive). */
const NO_ATTRIBUTION_SPDX = new Set(['MIT', 'Apache-2.0', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Unlicense', 'CC0-1.0']);

interface IconifyCollectionInfo {
  name: string;
  license: { title: string; spdx?: string; url?: string };
  author?: { name?: string; url?: string };
}

interface IconifySearchResponse {
  icons: string[];   // e.g. ["mdi:home", "ph:house-bold"]
  total: number;
  collections: Record<string, IconifyCollectionInfo>;
}

interface IconResult {
  name: string;
  svg: string;
  setName: string;
  license: string;
  licenseUrl?: string;
  needsAttribution: boolean;
}

/**
 * Search for icons and return their SVG code.
 * Called from the agentic loop when the model invokes search_icons.
 */
export async function searchIcons(
  query: string,
  style: 'outline' | 'filled' | 'any',
  noAttribution: boolean,
  signal?: AbortSignal,
): Promise<string> {
  // 1. Search Iconify API
  const params = new URLSearchParams({ query, limit: '32' });
  if (style === 'outline') {
    params.set('prefixes', OUTLINE_PREFIXES);
  } else if (style === 'filled') {
    params.set('prefixes', FILLED_PREFIXES);
  }

  const searchRes = await fetch(`${ICONIFY_API}/search?${params}`, { signal });
  if (!searchRes.ok) {
    return `Icon search failed (HTTP ${searchRes.status}). Try a different query or use manual SVG.`;
  }

  const data: IconifySearchResponse = await searchRes.json();
  if (data.icons.length === 0) {
    return `No icons found for "${query}". Try a different keyword or use generate_image for custom illustrations.`;
  }

  // 2. Filter by license if noAttribution is requested
  let candidates = data.icons;
  if (noAttribution) {
    candidates = candidates.filter(iconId => {
      const prefix = iconId.split(':')[0];
      const col = data.collections[prefix];
      return col?.license?.spdx && NO_ATTRIBUTION_SPDX.has(col.license.spdx);
    });
    if (candidates.length === 0) {
      return `No attribution-free icons found for "${query}". Try searching with noAttribution=false, or use generate_image.`;
    }
  }

  // 3. Pick top N unique icon sets to get variety
  const selected = pickDiverseIcons(candidates, MAX_RESULTS);

  // 4. Fetch SVG for each selected icon (in parallel)
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
    return `Found icon names but failed to fetch SVG. Try again or use generate_image.`;
  }

  // 5. Format results for the model — include license info
  const parts = icons.map((icon, i) => {
    const licenseNote = icon.needsAttribution
      ? ` — ⚠️ requires attribution (${icon.licenseUrl ?? icon.license})`
      : '';
    return `### Icon ${i + 1}: ${icon.name} — ${icon.setName} (${icon.license})${licenseNote}\n\`\`\`svg\n${icon.svg}\n\`\`\``;
  });
  return `Found ${data.total} icons for "${query}". Top ${icons.length} matches:\n\n${parts.join('\n\n')}\n\nPick the best match and insert it into the SVG using replace_lines or replace_svg. Adjust position, size (width/height or transform), and colors (fill/stroke) to fit the document. If an icon requires attribution, mention it to the user with the license link.`;
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

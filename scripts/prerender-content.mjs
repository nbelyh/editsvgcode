#!/usr/bin/env node
/**
 * Put the content routes' markup inside the shell's #root, so a crawler that
 * never runs JavaScript reads the page instead of an empty div.
 *
 * Runs after prerender.cjs, which is what creates dist/<route>/index.html in the
 * first place and stamps each one's title/description/og tags. This script only
 * fills the body. Splitting them keeps the head rewriting — which every route
 * needs, including the ones that cannot be server-rendered — independent of a
 * server bundle that only eight routes use.
 *
 * The markup is a subset of what a reader gets, not a variant of it: the same
 * components, rendered without <App>'s header. React replaces it wholesale on
 * mount, so nothing here has to survive hydration.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = process.env.PRERENDER_DIST || 'dist';
const SSR_BUNDLE = path.resolve('dist-ssr/entry-server.js');

if (!fs.existsSync(SSR_BUNDLE)) {
  console.error(`${SSR_BUNDLE} not found — run "npm run build:ssr" first.`);
  process.exit(1);
}

const { SSR_ROUTES, renderRoute, APP_SHELL_HEADER_HEIGHT } = await import(pathToFileURL(SSR_BUNDLE).href);

// An empty #root, exactly as the shell ships it. Matching the empty form rather
// than anything greedier is what makes a second run a no-op instead of nesting
// one render inside the last — the injected markup is full of <div>s, so a
// pattern loose enough to match a filled root would swallow the wrong closing tag.
const EMPTY_ROOT = '<div id="root"></div>';

let filled = 0;
let skipped = 0;
for (const route of SSR_ROUTES) {
  const file = path.join(DIST, route.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(file)) {
    throw new Error(`${file} not found — prerender.cjs must run before this script, ` +
      `and ${route} must be a route in route-meta.json.`);
  }
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes(EMPTY_ROOT)) {
    // Already filled by an earlier run, or index.html changed shape. Either way
    // silently rewriting would be worse than saying so.
    console.warn(`  ${route} — #root is not empty, left alone`);
    skipped++;
    continue;
  }
  const body = renderRoute(route);
  if (!body) {
    throw new Error(`${route} is in SSR_ROUTES but renderRoute returned nothing.`);
  }
  // Wrapped so the page is usable before the bundle lands, which is the point of
  // rendering it at all — otherwise a slow connection shows nothing.
  //
  // The padding is the header <App> would have drawn: this markup does not
  // include it, so the content would sit that much too high and jump when the
  // real header mounted. The height and scrolling are because #root is
  // `height:100dvh; overflow:hidden` (App.css) — inside it an auto-height wrapper
  // is simply clipped to one viewport with no way to scroll, and the padding
  // would push another header's worth out of sight. Matching the root's height
  // and taking the scrolling itself gives the whole page back; border-box keeps
  // the padding inside that height rather than adding to it.
  const shell = `<div style="height:100dvh;overflow-y:auto;box-sizing:border-box;`
    + `padding-top:${APP_SHELL_HEADER_HEIGHT}px">${body}</div>`;
  // A replacer function, not a string: `$&`, "$'" and friends in page copy are
  // substitution patterns to String.replace, and would splice the surrounding
  // markup into the middle of the text. prerender.cjs guards its og:image the
  // same way, for the same reason.
  fs.writeFileSync(file, html.replace(EMPTY_ROOT, () => `<div id="root">${shell}</div>`));
  const words = body.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
  console.log(`  ${route} -> ${words} words`);
  filled++;
}
console.log(`Server-rendered ${filled} route(s)${skipped ? `, skipped ${skipped}` : ''}.`);

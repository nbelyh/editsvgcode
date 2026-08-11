#!/usr/bin/env node
/**
 * Give each static route its own HTML in dist/, with real title/description/og
 * tags baked in.
 *
 * Everything is rewritten to /index.html by Firebase Hosting, so without this
 * every URL is served the editor's <head>. The app fixes that at runtime via
 * <PageMeta>, which is enough for Google (it renders JS) — but not for the
 * crawlers that do not: GPTBot, ClaudeBot, PerplexityBot, Bing and Yandex to a
 * degree, and every social scraper. Those see only what is in the file.
 *
 * Output is dist/<route>/index.html. Firebase serves a matching static file
 * before it applies the "**" rewrite, so /features hits the prerendered page
 * and anything unlisted still falls through to the SPA shell.
 *
 * The copy comes from src/lib/route-meta.json — the same file <PageMeta> reads,
 * so the two cannot drift.
 */
const fs = require('node:fs');
const path = require('node:path');

const DIST = 'dist';
const meta = JSON.parse(fs.readFileSync('src/lib/route-meta.json', 'utf8'));

// Canonical and og:url must name the origin actually being deployed to, or beta
// claims production's URLs. firebase sets GCLOUD_PROJECT for predeploy hooks —
// the same signal stamp-config.cjs uses to pick a runtime config.
const SITE_URLS = {
  'editsvgcode-db': 'https://editsvgcode.com',
  'editsvgcode-beta': 'https://editsvgcode-beta.web.app',
};
const project = process.env.GCLOUD_PROJECT;
const SITE_URL = process.env.SITE_URL || SITE_URLS[project] || SITE_URLS['editsvgcode-db'];
if (!process.env.SITE_URL && project && !SITE_URLS[project]) {
  console.warn(`Unknown project "${project}" — prerendering against ${SITE_URL}. ` +
    'Add it to SITE_URLS or set SITE_URL.');
}

const shellPath = path.join(DIST, 'index.html');
if (!fs.existsSync(shellPath)) {
  console.error(`${shellPath} not found — run the build first.`);
  process.exit(1);
}
const shell = fs.readFileSync(shellPath, 'utf8');

/** Replace a tag's content, or report loudly rather than silently doing nothing. */
function replaceOrFail(html, pattern, replacement, what, route) {
  if (!pattern.test(html)) {
    throw new Error(`${what} not found in the built shell while prerendering ${route} — ` +
      'index.html changed shape and this script needs updating.');
  }
  return html.replace(pattern, replacement);
}

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// index.html keeps its own og:image, and has to: it is what a non-JS crawler
// sees on `/` and on `/:fileId`, neither of which is prerendered. That makes it
// a second copy of defaultImage, and two copies of one value drift. They cannot
// be merged — one is an absolute URL in a static file, the other a path this
// script resolves per environment — so assert they still name the same picture
// instead. A share card pointing at a deleted screenshot is invisible until
// somebody shares the page.
const shellImage = shell.match(/<meta property="og:image" content="([^"]*)"/);
if (!shellImage) {
  throw new Error('og:image missing from the built shell — index.html changed shape.');
}
if (!shellImage[1].endsWith(meta.defaultImage)) {
  throw new Error(`index.html's og:image (${shellImage[1]}) and defaultImage ` +
    `(${meta.defaultImage}) in route-meta.json name different pictures. ` +
    'Change both, or the home page and every other page share differently.');
}

// Beta serves the same pages from a different origin, which to a crawler is a
// duplicate of production competing with it. noindex rather than a robots.txt
// disallow: disallow stops the crawl, and a page that is never crawled is one
// whose noindex is never read — the URL can still be indexed bare from a link
// somewhere else. Letting it crawl and telling it not to index is the pair that
// actually removes a staging site from search results.
//
// Written back to the shell as well as into each route: everything unlisted
// falls through Firebase's "**" rewrite to dist/index.html, so the shell is
// what a crawler gets for `/` and for every shared /:fileId link.
//
// Stripped unconditionally before it is re-added, so the tag can never survive
// from an earlier run: a beta build followed by a production one over the same
// dist/ would otherwise ship production marked noindex, which is the single
// worst outcome this script could produce. Removing first also keeps repeated
// beta builds from stacking the tag.
const isProduction = SITE_URL === SITE_URLS['editsvgcode-db'];
let shellHtml = shell.replace(/\s*<meta name="robots"[^>]*>/gi, '');
if (!isProduction) {
  shellHtml = shellHtml.replace('</head>',
    '  <meta name="robots" content="noindex, nofollow" />\n  </head>');
}
fs.writeFileSync(shellPath, shellHtml);
console.log(isProduction
  ? 'Shell is indexable — production origin.'
  : `Marked noindex — ${SITE_URL} is not the production origin.`);

let written = 0;
for (const [route, { title, description, image }] of Object.entries(meta.routes)) {
  const fullTitle = `${title} — ${meta.siteName}`;
  const url = `${SITE_URL}${route}`;
  let html = shellHtml;

  // Monaco's stylesheet preload belongs to the editor shell alone. None of
  // these routes ever mounts an editor, and preloading ~300 KB of editor CSS
  // on them spends bandwidth against their own LCP at the highest priority the
  // browser has — on exactly the pages this script exists to make fast — and
  // earns a "preloaded but not used" warning for it. Removed rather than never
  // injected because the shell is also what serves the editor, which needs it.
  html = replaceOrFail(html, /[ \t]*<link rel="preload" as="style" href="[^"]*\/monaco-editor@[^"]*"[^>]*>\r?\n?/,
    '', 'Monaco stylesheet preload', route);

  html = replaceOrFail(html, /<title>[\s\S]*?<\/title>/,
    `<title>${escapeAttr(fullTitle)}</title>`, '<title>', route);
  html = replaceOrFail(html, /<meta name="description" content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeAttr(description)}" />`, 'description meta', route);
  html = replaceOrFail(html, /<meta property="og:title" content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeAttr(fullTitle)}" />`, 'og:title', route);
  html = replaceOrFail(html, /<meta property="og:description" content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeAttr(description)}" />`, 'og:description', route);

  // Scrapers do not resolve a relative og:image, so it must be absolute.
  //
  // The picture comes from route-meta.json — the route's own if it names one,
  // otherwise defaultImage — never from the shell. index.html hard-codes a
  // production URL, and taking the fallback from there would mean two sources
  // of truth for the same tag: editing defaultImage would move it at runtime
  // and leave every prerendered page, which is what the crawlers this script
  // exists for actually read, still pointing at the old picture.
  const ogImage = html.match(/<meta property="og:image" content="[^"]*"\s*\/?>/);
  if (!ogImage) {
    throw new Error(`og:image missing from the built shell while prerendering ${route}.`);
  }
  const src = image || meta.defaultImage;
  if (!src) {
    throw new Error('No og:image for ' + route + ' — add one to the route, or set ' +
      'defaultImage in route-meta.json.');
  }
  if (src.startsWith('/')) {
    // Root-relative: resolved against the origin being deployed to, and the
    // file has to be in the build or the card points at a 404. Only checked
    // here — an absolute URL names someone else's host, which is not ours to
    // look for on disk.
    if (!fs.existsSync(path.join(DIST, src.replace(/^\//, '')))) {
      throw new Error(`og:image "${src}" for ${route} is not in ${DIST} — ` +
        'the share card would point at a 404.');
    }
    html = html.replace(ogImage[0], () => `<meta property="og:image" content="${SITE_URL}${escapeAttr(src)}" />`);
  } else if (/^https?:\/\//.test(src)) {
    // A function, not a string: `$&` and friends in a replacement string are
    // substitution patterns, and a URL is the one value here that can carry one.
    html = html.replace(ogImage[0], () => `<meta property="og:image" content="${escapeAttr(src)}" />`);
  } else {
    throw new Error(`og:image "${src}" is neither absolute nor root-relative — ` +
      'scrapers will not resolve it.');
  }

  // Canonical and og:url are not in the shell — the SPA sets them per route at
  // runtime — so add them here for the crawlers that never get that far.
  html = html.replace('</head>',
    `  <meta property="og:url" content="${escapeAttr(url)}" />\n` +
    `    <link rel="canonical" href="${escapeAttr(url)}" />\n  </head>`);

  const outDir = path.join(DIST, route.replace(/^\//, ''));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  console.log(`  ${route} -> ${path.join(outDir, 'index.html')}`);
  written++;
}
console.log(`Prerendered ${written} route(s) against ${SITE_URL}.`);

// A sitemap is not how these pages get found: every one of them is linked from
// the header, and Google renders the JS that draws it. It is here for the
// crawlers that do not render — and to be the discovery mechanism the gallery
// needs once it lists more documents than the nav can link to.
//
// No <lastmod>: stamping today's date on every URL at every deploy claims each
// page just changed, and a lastmod that is always "now" is one search engines
// learn to ignore. Better to omit it than to assert something untrue.
//
// Built on beta exactly as on production, listing beta's own URLs, so the thing
// deployed there is the thing being tested — a sitemap only production produces
// is a sitemap nobody sees fail. The noindex above is what keeps beta out of
// search results; a sitemap does not override it, it only offers URLs to a
// crawler that has already been told not to index them.
const sitemapRoutes = ['/', ...Object.keys(meta.routes)];
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemapRoutes.map((route) => `  <url><loc>${SITE_URL}${route}</loc></url>\n`).join('') +
  '</urlset>\n';
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);

// robots.txt ships from public/ with no origin in it, because the origin
// differs per environment. Any Sitemap line from a previous run is dropped
// first, so repeated builds cannot stack them and a beta build cannot inherit
// production's address.
const robotsPath = path.join(DIST, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  throw new Error(`${robotsPath} not found — public/robots.txt is expected in the build.`);
}
const robots = fs.readFileSync(robotsPath, 'utf8').replace(/^sitemap:.*$/gim, '').trimEnd();
fs.writeFileSync(robotsPath, `${robots}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`Wrote sitemap.xml with ${sitemapRoutes.length} URL(s), and pointed robots.txt at it.`);

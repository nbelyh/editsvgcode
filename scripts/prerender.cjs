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

let written = 0;
for (const [route, { title, description }] of Object.entries(meta.routes)) {
  const fullTitle = `${title} — ${meta.siteName}`;
  const url = `${SITE_URL}${route}`;
  let html = shell;

  html = replaceOrFail(html, /<title>[\s\S]*?<\/title>/,
    `<title>${escapeAttr(fullTitle)}</title>`, '<title>', route);
  html = replaceOrFail(html, /<meta name="description" content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeAttr(description)}" />`, 'description meta', route);
  html = replaceOrFail(html, /<meta property="og:title" content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeAttr(fullTitle)}" />`, 'og:title', route);
  html = replaceOrFail(html, /<meta property="og:description" content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeAttr(description)}" />`, 'og:description', route);

  // Scrapers do not resolve a relative og:image, so it must be absolute.
  // index.html already hard-codes the production URL, but check rather than
  // assume: a relative path here silently costs every share card its picture.
  const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/);
  if (!ogImage) {
    throw new Error(`og:image missing from the built shell while prerendering ${route}.`);
  }
  if (ogImage[1].startsWith('/')) {
    html = html.replace(ogImage[0],
      `<meta property="og:image" content="${SITE_URL}${ogImage[1]}"`);
  } else if (!/^https?:\/\//.test(ogImage[1])) {
    throw new Error(`og:image "${ogImage[1]}" is neither absolute nor root-relative — ` +
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

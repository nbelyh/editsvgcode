/**
 * Grade what scripts/e2e-compare.mjs saved, strictly, against e2e/compare/cases.json.
 *
 *   node scripts/compare-grade.mjs            every label under compare-results
 *   node scripts/compare-grade.mjs before after
 *
 * A case's `expect` decides what passing means:
 *   lines + colour  exactly those source lines (of the original) took the colour, nothing else
 *                   changed, nothing was added; `mayAlsoChange` lists lines allowed to change too
 *   text            a <text> holds that string; with `colour` it took that colour, with
 *                   `fontSize` its size is within 10% of it
 *   title           a <title> was added that mentions every listed word
 *   parts           judged by pixels, for drawings whose parts share a path: each part has a
 *                   mask file and a `want` — "same" (unchanged), "reference" (as in the
 *                   reference result), "ink" (visible on white), or a "#rrggbb" it must take.
 *                   `outside` says what the rest must be: "same" (default), "blank" or "any".
 *   viewBox         the new viewBox `contains` a box, with no side over `maxSide`
 * A case without `expect` is shown as "by eye". Colours are judged by family (red, blue, grey,
 * green, purple), since the model picks its own shade.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'compare-results');
const cases = Object.fromEntries(JSON.parse(readFileSync(resolve(ROOT, 'e2e/compare/cases.json'), 'utf8')).map((c) => [c.id, c]));
const labels = process.argv.slice(2).length ? process.argv.slice(2) : existsSync(OUT) ? readdirSync(OUT) : [];
if (labels.length === 0) {
  console.error('Nothing to grade: run node scripts/e2e-compare.mjs first.');
  process.exit(2);
}

const browser = await chromium.launch();
const page = await browser.newPage();
const grades = {};

for (const label of labels) {
  const dir = resolve(OUT, label);
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const run = JSON.parse(readFileSync(resolve(dir, file), 'utf8'));
    const c = cases[run.id];
    if (!c) continue;
    const before = readFileSync(resolve(ROOT, c.svg), 'utf8');
    const after = readFileSync(resolve(dir, file.replace(/\.json$/, '.svg')), 'utf8');
    const read = (f) => readFileSync(resolve(ROOT, f), 'utf8');
    const g = !c.expect ? { verdict: 'by eye', why: '' }
      : c.expect.parts || c.expect.viewBox
        ? await page.evaluate(gradePixels, {
          before, after, expect: c.expect,
          reference: c.expect.reference ? read(c.expect.reference) : null,
          masks: (c.expect.parts ?? []).map((part) => read(part.mask)),
        })
        : await page.evaluate(grade, { before, after, expect: c.expect });
    grades[`${label}/${file.replace(/\.json$/, '')}`] = { ...g, seconds: Math.round(run.seconds), calls: run.calls.map((x) => x.name) };
    console.log(`${label}/${file.replace(/\.json$/, '')}`.padEnd(28), g.verdict.padEnd(8), g.why.padEnd(48), `${Math.round(run.seconds)} s`, run.calls.map((x) => x.name).join(', '));
  }
}
await browser.close();
writeFileSync(resolve(OUT, 'grades.json'), JSON.stringify(grades, null, 2));

/** Runs in the browser, which reads colours the way the drawing will be painted. */
function grade({ before, after, expect }) {
  const parse = (s) => new DOMParser().parseFromString(s, 'image/svg+xml');
  const A = parse(before), B = parse(after);
  if (B.getElementsByTagName('parsererror').length) return { verdict: 'fail', why: 'the result does not parse' };
  const ctx = document.createElement('canvas').getContext('2d');
  const norm = (v) => { ctx.fillStyle = '#000001'; ctx.fillStyle = v || '#000001'; return String(ctx.fillStyle); };
  const fillOf = (el) => norm(/fill:\s*([^;"]+)/.exec(el.getAttribute('style') || '')?.[1]?.trim() ?? el.getAttribute('fill'));
  const family = (h, colour) => {
    if (!/^#[0-9a-f]{6}$/.test(h)) return false;
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const hi = Math.max(r, g, b), lo = Math.min(r, g, b);
    return {
      red: r > 140 && g < 110 && b < 110,
      blue: b > r + 25 && b >= g - 10,
      grey: hi - lo < 32 && hi > 60,
      green: g > r + 15 && g > b + 10,
      purple: r > g + 30 && b > g + 30,
    }[colour];
  };

  if (expect.title) {
    const t = B.querySelector('title')?.textContent?.trim() ?? '';
    if (!t) return { verdict: 'fail', why: 'no title added' };
    const missing = expect.title.filter((w) => !new RegExp(`\\b${w}`, 'i').test(t));
    return { verdict: missing.length ? 'fail' : 'pass', why: missing.length ? `title lacks ${missing.join(', ')}: "${t.slice(0, 60)}"` : `"${t.slice(0, 60)}"` };
  }
  if (expect.text) {
    const el = Array.from(B.getElementsByTagName('text')).find((e) => e.textContent.includes(expect.text));
    if (!el) return { verdict: 'fail', why: `no text reads "${expect.text}"` };
    const problems = [];
    if (expect.colour) {
      const h = fillOf(el);
      if (!family(h, expect.colour)) problems.push(`text is ${h}, not ${expect.colour}`);
    }
    if (expect.fontSize) {
      // The size can sit on the element, in its style, or on a parent group.
      let size = NaN;
      for (let n = el; n && Number.isNaN(size); n = n.parentElement) {
        size = parseFloat(/font-size:\s*([\d.]+)/.exec(n.getAttribute('style') || '')?.[1] ?? n.getAttribute('font-size') ?? '');
      }
      if (!(Math.abs(size - expect.fontSize) <= expect.fontSize * 0.1)) problems.push(`font size ${Number.isNaN(size) ? 'unset' : size}, not ${expect.fontSize}`);
    }
    return { verdict: problems.length ? 'fail' : 'pass', why: problems.join('; ') || 'the text as asked' };
  }

  // Shapes are matched before and after by their geometry, so an edit that moves lines around
  // in the file is still compared shape for shape.
  const key = (el) => `${el.tagName}|${el.getAttribute('d') || el.getAttribute('points') || `${el.getAttribute('x')},${el.getAttribute('y')},${el.getAttribute('width')}x${el.getAttribute('height')}`}`;
  const drawn = (doc) => Array.from(doc.querySelectorAll('path, polygon, rect, circle, ellipse, polyline'));
  const lines = before.split('\n');
  const lineOf = (el) => {
    const geometry = el.getAttribute('d') || el.getAttribute('points');
    return geometry ? lines.findIndex((l) => l.includes(geometry.slice(0, 40))) + 1 : 0;
  };
  const twins = new Map(drawn(B).map((el) => [key(el), el]));
  const changed = [], removed = [];
  for (const el of drawn(A)) {
    const twin = twins.get(key(el));
    if (!twin) removed.push(lineOf(el));
    else if (fillOf(twin) !== fillOf(el)) changed.push({ line: lineOf(el), to: fillOf(twin) });
  }
  const added = drawn(B).length - (drawn(A).length - removed.length);
  const allowed = expect.mayAlsoChange ?? [];
  const missed = expect.lines.filter((ln) => !family(changed.find((x) => x.line === ln)?.to ?? '', expect.colour));
  const extra = changed.filter((x) => !expect.lines.includes(x.line) && !allowed.includes(x.line)).map((x) => x.line);
  const why = [
    missed.length && `line ${missed.join(', ')} not ${expect.colour}`,
    extra.length && `also changed line ${extra.join(', ')}`,
    removed.length && `removed ${removed.length}`,
    added && `added ${added}`,
  ].filter(Boolean).join('; ');
  return { verdict: why ? (missed.length ? 'fail' : 'partial') : 'pass', why: why || 'exactly the target' };
}

/**
 * Pixel grading, in the browser. Every drawing is rendered at 256 px in the ORIGINAL's viewBox,
 * so a result that split or rewrote paths is still compared area for area. Masks are eroded by a
 * pixel, so anti-aliased edges do not count against a part.
 */
async function gradePixels({ before, after, expect, reference, masks }) {
  const N = 256;
  const doc = (s) => new DOMParser().parseFromString(s, 'image/svg+xml');
  if (doc(after).getElementsByTagName('parsererror').length) return { verdict: 'fail', why: 'the result does not parse' };
  const vbOf = (s) => (doc(s).documentElement.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number);

  if (expect.viewBox) {
    const [x, y, w, h] = vbOf(after);
    const [bx, by, bw, bh] = expect.viewBox.contains;
    const holds = x <= bx && y <= by && x + w >= bx + bw && y + h >= by + bh;
    const small = Math.max(w, h) <= expect.viewBox.maxSide;
    const why = !Number.isFinite(w) ? 'no viewBox' : !holds ? `viewBox ${x} ${y} ${w} ${h} cuts the logo off` : !small ? `viewBox ${x} ${y} ${w} ${h} leaves too much around the logo` : `viewBox ${x} ${y} ${w} ${h}`;
    if (!expect.parts) return { verdict: holds && small ? 'pass' : 'fail', why };
  }

  const origVb = vbOf(before).join(' ');
  const pixels = async (s, background) => {
    const d = doc(s);
    const root = d.documentElement;
    root.setAttribute('viewBox', origVb);
    root.setAttribute('width', N);
    root.setAttribute('height', N);
    const img = new Image();
    await new Promise((ok) => { img.onload = ok; img.onerror = ok; img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(new XMLSerializer().serializeToString(d)))); });
    const c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d');
    if (background) { x.fillStyle = background; x.fillRect(0, 0, N, N); }
    x.drawImage(img, 0, 0, N, N);
    return x.getImageData(0, 0, N, N).data;
  };
  const erode = (m, k) => m.map((on, i) => {
    if (!on) return false;
    const px = i % N, py = (i / N) | 0;
    for (let dy = -k; dy <= k; dy++) for (let dx = -k; dx <= k; dx++) { const q = (py + dy) * N + px + dx; if (px + dx < 0 || px + dx >= N || py + dy < 0 || py + dy >= N || !m[q]) return false; }
    return true;
  });
  const dilate = (m, k) => m.map((on, i) => {
    if (on) return true;
    const px = i % N, py = (i / N) | 0;
    for (let dy = -k; dy <= k; dy++) for (let dx = -k; dx <= k; dx++) { const q = (py + dy) * N + px + dx; if (px + dx >= 0 && px + dx < N && py + dy >= 0 && py + dy < N && m[q]) return true; }
    return false;
  });
  const maskOf = async (s) => { const d = await pixels(s, null); return Array.from({ length: N * N }, (_, i) => d[i * 4 + 3] > 128); };

  const A = await pixels(before, '#ffffff'), B = await pixels(after, '#ffffff');
  const R = reference ? await pixels(reference, '#ffffff') : null;
  const at = (d, i) => [d[i * 4], d[i * 4 + 1], d[i * 4 + 2]];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const hex = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
  const holds = (want, i) => {
    const px = at(B, i);
    if (want === 'same') return dist(px, at(A, i)) < 40;
    if (want === 'reference') return dist(px, at(R, i)) < 40;
    if (want === 'ink') return Math.min(...px) < 200;
    if (want === 'blank') return Math.min(...px) > 235;
    if (want === 'any') return true;
    return dist(px, hex(want)) < 60;
  };
  const share = (mask, want) => { let n = 0, ok = 0; mask.forEach((on, i) => { if (on) { n++; if (holds(want, i)) ok++; } }); return n ? ok / n : 0; };

  const raw = await Promise.all(masks.map(maskOf));
  const problems = [];
  const count = (m) => m.reduce((n, on) => n + (on ? 1 : 0), 0);
  expect.parts.forEach((part, k) => {
    // Shrunk by a pixel so edge smoothing does not count; a part too thin to survive that is
    // judged on its full mask, so it is never left with nothing and passed by default.
    const eroded = erode(raw[k], 1);
    const s = share(count(eroded) >= 20 ? eroded : raw[k], part.want);
    const need = part.want === 'same' || part.want === 'reference' ? 0.97 : 0.85;
    if (s < need) problems.push(`${part.name} ${Math.round(s * 100)}% ${part.want}`);
  });
  const covered = dilate(raw.reduce((u, m) => u.map((v, i) => v || m[i]), new Array(N * N).fill(false)), 2);
  const outside = expect.outside ?? 'same';
  const s = share(covered.map((v) => !v), outside);
  if (s < 0.97) problems.push(`rest ${Math.round(s * 100)}% ${outside}`);
  return { verdict: problems.length ? 'fail' : 'pass', why: problems.join('; ') || 'every part as asked' };
}

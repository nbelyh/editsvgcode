/**
 * Grade what scripts/e2e-compare.mjs saved, strictly, against e2e/compare/cases.json.
 *
 *   node scripts/compare-grade.mjs            every label under test-results/compare
 *   node scripts/compare-grade.mjs before after
 *
 * A case's `expect` decides what passing means:
 *   lines + colour  exactly those source lines (of the original) took the colour, nothing else
 *                   changed, nothing was added; `mayAlsoChange` lists lines allowed to change too
 *   text + colour   the <text> holding that string took the colour
 *   title           a <title> was added that mentions every listed word
 * A case without `expect` is shown as "by eye". Colours are judged by family (red, blue, grey,
 * green, purple), since the model picks its own shade.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'test-results/compare');
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
    const g = c.expect ? await page.evaluate(grade, { before, after, expect: c.expect }) : { verdict: 'by eye', why: '' };
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
    if (!el) return { verdict: 'fail', why: 'the text is gone' };
    const h = fillOf(el);
    return { verdict: family(h, expect.colour) ? 'pass' : 'fail', why: `text set to ${h}` };
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

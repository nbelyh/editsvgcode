import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { waitForEditor, setSvgContent } from '../support/helpers.js';
import { signInTestUser, useEmulatorSuite } from '../support/emulator.js';
import { readChatStream } from '../../src/lib/chat-stream';

/**
 * Measuring a change to the AI: run a fixed set of edits through the real chat loop and keep
 * every result, so two builds — or two models — can be compared run for run.
 *
 * Opt-in and never part of the ordinary suite: it calls a real model and spends credits. Run it
 * through `node scripts/e2e-compare.mjs`, which sets the model, effort, label and repeat count,
 * and grade what it wrote with `node scripts/compare-grade.mjs`.
 *
 * Each run saves the resulting SVG, every picture the model looked at, and a JSON record of its
 * tool calls, token usage, time and reply, under `compare-results/<label>/<case>-<run>.*`. Offers to
 * redraw with the image model are declined, so the score is always the chat model's own edit.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ON = process.env.COMPARE === '1';
const OUT = resolve(ROOT, process.env.COMPARE_OUT ?? 'compare-results', process.env.COMPARE_LABEL ?? 'run');
const MODEL = process.env.COMPARE_MODEL;
const EFFORT = process.env.COMPARE_EFFORT;
const ONLY = process.env.COMPARE_ONLY?.split(',').map((s) => s.trim()).filter(Boolean);
// The same build without the picture tool: the page's request goes out without the flag that
// has the API offer get_png_image, so a run with and a run without differ in that alone.
const NO_PICTURES = process.env.COMPARE_NO_PICTURES === '1';

interface Case { id: string; svg: string; prompt: string; expect?: { offer?: boolean } }
const cases: Case[] = JSON.parse(readFileSync(resolve(ROOT, 'e2e/compare/cases.json'), 'utf8'));
// Cases built from users' own requests stay on this machine: e2e/compare/private/ is gitignored,
// and its cases run alongside the shared ones when the file is there.
const PRIVATE = resolve(ROOT, 'e2e/compare/private/cases.json');
if (existsSync(PRIVATE)) cases.push(...(JSON.parse(readFileSync(PRIVATE, 'utf8')) as Case[]));

useEmulatorSuite({ parallel: true });

test.describe('compare', () => {
  test.skip(!ON, 'Run through node scripts/e2e-compare.mjs (spends credits, needs the API host on :7071)');
  test.skip(({ browserName }) => browserName !== 'chromium', 'The model, not the browser, is under test');

  for (const c of cases.filter((x) => !ONLY || ONLY.includes(x.id))) {
    test(c.id, async ({ page }, info) => {
      test.setTimeout(1_200_000);
      mkdirSync(OUT, { recursive: true });
      const name = `${c.id}-${info.repeatEachIndex + 1}`;
      const svg = readFileSync(resolve(ROOT, c.svg), 'utf8');

      const calls: Array<{ name: string; args: string }> = [];
      const usage: unknown[] = [];
      const pictures: string[] = [];
      // What each tool returned, as the next round sent it back: the model's view of its own calls.
      const results: Array<{ id: string; output: string }> = [];
      // What the model reasoned, per request, where it streams a summary: why it did what it did.
      const reasoning: string[] = [];
      // The first request as the page sent it, to replay outside the browser.
      let firstInput: unknown = null;
      let requests = 0;
      await page.route('**/api/chat', async (route) => {
        requests++;
        const sent = JSON.parse(route.request().postData() ?? '{}');
        if (requests === 1) firstInput = sent;
        for (const item of sent.input ?? []) {
          if (item?.type === 'function_call_output' && !results.some((r) => r.id === item.call_id)) {
            results.push({ id: item.call_id, output: String(item.output).slice(0, 4000) });
          }
          for (const part of Array.isArray(item.content) ? item.content : []) {
            if (part?.type === 'input_image' && !pictures.includes(part.image_url)) pictures.push(part.image_url);
          }
        }
        // A turn's rounds can run for minutes on a slow model.
        const response = await route.fetch({
          timeout: 900_000,
          ...(NO_PICTURES && { postData: JSON.stringify({ ...sent, pictures: undefined }) }),
        });
        const body = await response.text();
        let thought = '';
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const reply: any = body.trimStart().startsWith('{') ? JSON.parse(body) : await readChatStream<any>(new Response(body).body!, (u) => { if (u.kind === 'reasoning') thought += u.delta; });
          for (const item of reply.output ?? []) if (item.type === 'function_call') calls.push({ name: item.name, args: item.arguments });
          if (reply.tokens) usage.push(reply.tokens);
          reasoning.push(thought);
        } catch { /* an error reply is the page's to show */ }
        await route.fulfill({ response, body });
      });

      await page.goto('/');
      await waitForEditor(page);
      await signInTestUser(page);
      await page.evaluate(({ model, effort }) => {
        localStorage.setItem('esvg-sidebar-tab', 'ai');
        if (model) localStorage.setItem('esvg-model', model);
        if (model && effort) localStorage.setItem('esvg-effort-by-model', JSON.stringify({ [model]: effort }));
      }, { model: MODEL, effort: EFFORT });
      await page.reload();
      await waitForEditor(page);
      await setSvgContent(page, svg);

      const started = Date.now();
      const composer = page.locator('textarea.aui-composer-input');
      await expect(composer).toBeVisible({ timeout: 20000 });
      await composer.fill(c.prompt);
      await composer.press('Enter');
      const stop = page.getByRole('button', { name: 'Stop' });
      await expect(stop).toBeVisible({ timeout: 20000 });
      let declined = 0;
      // A routing case asks only whether a picture is offered: the answer is in as soon as the
      // offer shows, so the turn is stopped there instead of waiting for a hand drawing.
      const routing = c.expect?.offer !== undefined;
      let offered = false;
      await expect.poll(async () => {
        // The icon picker holds the turn open until the user chooses; take the first match,
        // as most people would.
        const picker = page.locator('.aui-icon-picker:not(.aui-icon-picker-collapsed) .aui-icon-picker-item');
        if (await picker.count()) {
          await picker.first().click().catch(() => {});
          return 'running';
        }
        const offer = page.locator('.aui-image-confirm');
        if (await offer.count()) {
          offered = true;
          if (routing) {
            await stop.click().catch(() => {});
            return 'done';
          }
          await offer.locator('button').nth(1).click().catch(() => {});
          declined++;
          return 'running';
        }
        return (await stop.count()) === 0 ? 'done' : 'running';
      }, { timeout: 1_100_000, intervals: [1000] }).toBe('done');
      const seconds = (Date.now() - started) / 1000;

      const accept = page.locator('.aui-proposal').getByRole('button', { name: 'Accept' });
      for (let i = 0; i < 20 && (await accept.count()) > 0; i++) {
        await accept.first().click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(300);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: string = await page.evaluate(() => (window as any).__test_monaco_editor?.getValue() ?? '');
      const reply = (await page.locator('.aui-msg').last().innerText().catch(() => '')).trim();

      writeFileSync(`${OUT}/${name}.svg`, result);
      pictures.forEach((p, i) => writeFileSync(`${OUT}/${name}.look${i + 1}.png`, Buffer.from(p.split(',')[1], 'base64')));
      writeFileSync(`${OUT}/${name}.json`, JSON.stringify({
        id: c.id, run: info.repeatEachIndex + 1, model: MODEL ?? null, effort: EFFORT ?? null, prompt: c.prompt,
        seconds, requests, offered, declined, calls, results, reasoning, firstInput, usage, looks: pictures.length, reply, changed: result.trim() !== svg.trim(),
      }, null, 2));
      console.log(`${name}: ${seconds.toFixed(0)} s, ${calls.length} calls (${calls.map((x) => x.name).join(', ')})`);
    });
  }
});

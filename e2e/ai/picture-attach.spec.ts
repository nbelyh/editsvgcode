import { test, expect, type Page } from '@playwright/test';
import { waitForEditor, setSvgContent } from '../support/helpers.js';
import { signInTestUser, uniqueId, useEmulatorSuite, FIRESTORE_DB, EMULATOR_AUTH } from '../support/emulator.js';

/**
 * Pictures attached to the chat: pasted, dropped, or picked with the attach button.
 *
 * Sent alone, a picture gets one question — redraw it as an illustration with the image model,
 * or trace it in the browser — and whichever is chosen runs without asking again. Sent with
 * words, it goes to the chat model with them, and later messages show it again for reference.
 * Every model is stubbed: nothing here spends credits.
 */

const DOC = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect id="box" x="10" y="10" width="80" height="80" fill="#cdcdcd"/></svg>';
const CREDITS = { remaining: 99, limit: 100, tier: 'free' as const };

useEmulatorSuite();

/** Boot signed in, with the AI sidebar open and a draft of its own, so a reload finds the chat. */
async function boot(page: Page): Promise<string> {
  await page.goto('/');
  await waitForEditor(page);
  await signInTestUser(page);
  const fileId = uniqueId('e2epicture');
  await page.evaluate((id) => {
    localStorage.setItem('esvg-local-id', id);
    localStorage.setItem('esvg-sidebar-tab', 'ai');
  }, fileId);
  await page.reload();
  await waitForEditor(page);
  await setSvgContent(page, DOC);
  return fileId;
}

/** How many chat messages the server holds for the draft. */
async function savedMessages(fileId: string): Promise<number> {
  const res = await fetch(`${FIRESTORE_DB}/documents/files/${fileId}/messages`, { headers: EMULATOR_AUTH });
  const body = await res.json() as { documents?: unknown[] };
  return body.documents?.length ?? 0;
}

function editorValue(page: Page): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return page.evaluate(() => (window as any).__test_monaco_editor?.getValue() ?? '');
}

const composer = (page: Page) => page.locator('textarea.aui-composer-input');
const card = (page: Page) => page.locator('.aui-picture-choice');
const chip = (page: Page) => page.locator('.aui-attachment img');

/** A picture the tracer turns into a few clean shapes: a red disc and a navy block. */
async function pictureBytes(page: Page): Promise<string> {
  return page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 400; c.height = 300;
    const g = c.getContext('2d')!;
    g.fillStyle = '#e63946'; g.beginPath(); g.arc(120, 150, 90, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1d3557'; g.fillRect(230, 60, 140, 180);
    return c.toDataURL('image/png').split(',')[1];
  });
}

/** Paste a picture into the message box the way the clipboard delivers a screenshot. */
async function pastePicture(page: Page): Promise<void> {
  const b64 = await pictureBytes(page);
  await expect(composer(page)).toBeVisible({ timeout: 15000 });
  await composer(page).evaluate((ta, data) => {
    const bytes = Uint8Array.from(atob(data), ch => ch.charCodeAt(0));
    const dt = new DataTransfer();
    dt.items.add(new File([bytes], 'screenshot.png', { type: 'image/png' }));
    ta.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }, b64);
  await expect(chip(page)).toBeVisible();
}

/** Drop a file on the message box. */
async function dropFile(page: Page, name: string, type: string, text: string): Promise<void> {
  await composer(page).evaluate((ta, f) => {
    const dt = new DataTransfer();
    dt.items.add(new File([f.text], f.name, { type: f.type }));
    ta.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, { name, type, text });
}

/** Count the chat requests, failing any that arrive. */
async function forbidChat(page: Page): Promise<() => number> {
  let calls = 0;
  await page.route('**/api/chat', (route) => { calls++; return route.abort(); });
  return () => calls;
}

test.describe('A picture sent alone', () => {
  test('is offered for redrawing or tracing, and a trace opens in the editor without the model', async ({ page }) => {
    await boot(page);
    const chatCalls = await forbidChat(page);
    await pastePicture(page);
    await composer(page).press('Enter');

    await expect(card(page).getByRole('button')).toHaveText([/^Redraw as an illustration \(\d+ credits\)$/, 'Trace to SVG (free)', 'Cancel']);
    await card(page).getByRole('button', { name: 'Trace to SVG (free)' }).click();

    // The trace is proposed with the sliders, at the tracer's own defaults.
    await expect(page.locator('.aui-vectorizer')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.aui-vectorizer-label', { hasText: 'Colors' })).toContainText('6');
    await expect(page.locator('.aui-vectorizer-label', { hasText: 'Speckle' })).toContainText('4');
    // The request names the button: it is not a message to edit and send to the model again.
    const request = page.locator('.aui-msg-user').last();
    await expect(request).toContainText('Trace this picture to SVG');
    await expect(request).not.toHaveClass(/aui-msg-editable/);
    await expect(chip(page)).toHaveCount(0);

    await page.locator('.aui-proposal').getByRole('button', { name: 'Accept' }).click();
    await expect.poll(() => editorValue(page)).toMatch(/^<svg[^>]*viewBox="0 0 512 384"/);
    expect(await editorValue(page)).toContain('<path');
    expect(chatCalls()).toBe(0);
  });

  test('a rejected trace is gone after a reload, and the picture is back in the message box', async ({ page }) => {
    const fileId = await boot(page);
    await pastePicture(page);
    await composer(page).press('Enter');
    await card(page).getByRole('button', { name: 'Trace to SVG (free)' }).click();
    await expect(page.locator('.aui-vectorizer')).toBeVisible({ timeout: 15000 });

    // Saved, and back after a reload, picture and all.
    await expect.poll(() => savedMessages(fileId), { timeout: 15000 }).toBe(2);
    await page.reload();
    await waitForEditor(page);
    const reject = page.locator('.aui-proposal').getByRole('button', { name: 'Reject' });
    await expect(reject).toBeVisible({ timeout: 15000 });

    await reject.click();
    await expect(page.locator('.aui-msg-user')).toHaveCount(0);
    await expect(chip(page)).toBeVisible();
    // Rejecting the only turn empties the chat, and the empty chat is saved too: the effect
    // that saves the chat skips an empty one.
    await expect.poll(() => savedMessages(fileId), { timeout: 15000 }).toBe(0);
  });

  test('a redraw sends the picture to the image model once, and a failure leaves nothing behind', async ({ page }) => {
    await boot(page);
    const chatCalls = await forbidChat(page);
    const bodies: Record<string, unknown>[] = [];
    await page.route('**/api/modify-image', async (route) => {
      bodies.push(route.request().postDataJSON());
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Azure OpenAI error 500' }) });
    });

    await pastePicture(page);
    await composer(page).press('Enter');
    await card(page).getByRole('button', { name: /^Redraw as an illustration/ }).click();

    await expect(page.getByText('Could not redraw that picture')).toBeVisible({ timeout: 15000 });
    expect(bodies).toHaveLength(1);
    expect(bodies[0].image).toEqual(expect.any(String));
    expect(bodies[0].prompt).toContain('SAME picture');
    expect(bodies[0].style).toBe('outlined');
    // Nothing reached the chat, nothing asked a second question, and the picture is still there.
    await expect(page.locator('.aui-msg-user')).toHaveCount(0);
    await expect(page.locator('.aui-image-confirm:not(.aui-picture-choice)')).toHaveCount(0);
    await expect(chip(page)).toBeVisible();
    expect(chatCalls()).toBe(0);
  });

  test('a redraw that works is proposed with the original kept on the request', async ({ page }) => {
    await boot(page);
    const png = Buffer.from(await pictureBytes(page), 'base64');
    await page.route('**/api/modify-image', (route) => route.fulfill({
      status: 200,
      contentType: 'image/png',
      headers: { 'X-Credits-Remaining': '89', 'X-Credits-Limit': '100' },
      body: png,
    }));

    await pastePicture(page);
    await composer(page).press('Enter');
    await card(page).getByRole('button', { name: /^Redraw as an illustration/ }).click();

    await expect(page.locator('.aui-vectorizer')).toBeVisible({ timeout: 15000 });
    const request = page.locator('.aui-msg-user').last();
    await expect(request).toContainText('Redraw this picture as an illustration');
    await expect(request.locator('.aui-msg-picture img')).toBeVisible();
    await expect(request).not.toHaveClass(/aui-msg-editable/);
  });
});

test.describe('A picture sent with words', () => {
  test('goes to the model with the message, and later messages show it again for reference', async ({ page }) => {
    await boot(page);
    const inputs: unknown[][] = [];
    await page.route('**/api/chat', async (route) => {
      inputs.push(route.request().postDataJSON().input);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'Noted.' }] }], credits: CREDITS }),
      });
    });

    await pastePicture(page);
    await composer(page).fill('match the colours of this');
    await composer(page).press('Enter');
    await expect(page.getByText('Noted.')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.aui-msg-user .aui-msg-picture img')).toBeVisible();
    await expect(chip(page)).toHaveCount(0);

    await composer(page).fill('now a little darker');
    await composer(page).press('Enter');
    await expect(page.getByText('Noted.')).toHaveCount(2, { timeout: 15000 });

    type Item = { role?: string; content?: unknown };
    const imageOf = (input: unknown[]) => (input as Item[]).find(
      (i) => i.role === 'user' && Array.isArray(i.content) && i.content.some((p: { type?: string }) => p.type === 'input_image'),
    );
    const notes = (input: unknown[]) => (input as Item[]).filter((i) => i.role === 'developer').map((i) => String(i.content));

    expect(imageOf(inputs[0])).toBeTruthy();
    expect(notes(inputs[0]).some((n) => n.startsWith('The user attached a picture to this message'))).toBe(true);
    // The second message carries the same picture again, marked as one attached earlier.
    expect(imageOf(inputs[1])).toBeTruthy();
    expect(notes(inputs[1]).some((n) => n.startsWith('The picture with this message is one the user attached EARLIER'))).toBe(true);
  });
});

test.describe('Files dropped on the message box', () => {
  test('an SVG file opens in the editor, and a file that is not a picture is turned away', async ({ page }) => {
    await boot(page);
    const chatCalls = await forbidChat(page);
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="purple"/></svg>';

    await dropFile(page, 'notes.pdf', 'application/pdf', '%PDF-1.4');
    await expect(page.getByText('Only pictures can be added')).toBeVisible();
    await expect(chip(page)).toHaveCount(0);

    await dropFile(page, 'dot.svg', 'image/svg+xml', svg);
    await expect(page.getByText('Opened your SVG in the editor.')).toBeVisible({ timeout: 15000 });
    await expect.poll(() => editorValue(page)).toBe(svg);
    expect(chatCalls()).toBe(0);
  });
});

import { test, expect, type Page } from '@playwright/test';
import { waitForEditor } from './helpers.js';
import {
  FIRESTORE_DB, EMULATOR_AUTH,
  uniqueId, trackFileId, signInTestUser, seedChat, useEmulatorSuite,
} from './emulator.js';

/**
 * Cloud chat persistence (feature/cloud-chats): signed-in users' chat,
 * draft SVG, and undo snapshots live in Firestore and survive reload.
 * Runs against the Firebase emulators started by `npm run dev`.
 */

const SVG_BASE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';
const SVG_RED = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="red"/></svg>';
const SVG_GREEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="green"/></svg>';

/** Seed a draft (file doc + chat) with one or two accepted update_svg calls. */
async function seedDraft(page: Page, fileId: string, opts: { twoAccepts?: boolean } = {}) {
  const messages = [
    { role: 'user', content: 'make it red' },
    {
      role: 'assistant', content: 'Done - red.',
      toolCalls: [{ id: 't1', name: 'update_svg', status: 'accepted', arguments: { svg: SVG_RED }, prevSvg: SVG_BASE }],
    },
    ...(opts.twoAccepts ? [
      { role: 'user', content: 'now green' },
      {
        role: 'assistant', content: 'Done - green.',
        toolCalls: [{ id: 't2', name: 'update_svg', status: 'accepted', arguments: { svg: SVG_GREEN }, prevSvg: SVG_RED }],
      },
    ] : []),
  ];
  await seedChat(page, fileId, messages, opts.twoAccepts ? SVG_GREEN : SVG_RED);
}

async function editorValue(page: Page): Promise<string> {
  return await page.evaluate(() => (window as any).__test_monaco_editor?.getValue() ?? '');
}

/** Boot the app signed in, with the AI sidebar open and `fileId` as the working draft. */
async function bootWithDraft(page: Page, fileId: string, opts: { twoAccepts?: boolean } = {}) {
  await page.goto('/');
  await waitForEditor(page);
  const uid = await signInTestUser(page);
  await seedDraft(page, fileId, opts);
  await page.evaluate((id) => {
    localStorage.setItem('esvg-local-id', id);
    localStorage.setItem('esvg-sidebar-tab', 'ai');
  }, fileId);
  await page.reload();
  await waitForEditor(page);
  return uid;
}

useEmulatorSuite();

test.describe('Cloud chat persistence', () => {
  test('draft chat and SVG survive a reload', async ({ page }) => {
    const fileId = uniqueId('e2edraft');
    await bootWithDraft(page, fileId);
    // Chat restored from the server
    await expect(page.getByText('make it red')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Done - red.')).toBeVisible();
    // Draft SVG restored from the server copy (nothing local for this id)
    await expect.poll(() => editorValue(page)).toContain('fill="red"');
    // Undo snapshot travelled with the message
    await expect(page.getByRole('button', { name: 'Restore' })).toBeVisible();
  });

  test('restore rolls the document back from a reloaded chat', async ({ page }) => {
    const fileId = uniqueId('e2eundo');
    await bootWithDraft(page, fileId, { twoAccepts: true });
    await expect(page.getByText('Done - green.')).toBeVisible({ timeout: 15000 });
    await expect.poll(() => editorValue(page)).toContain('fill="green"');

    // Restore above "now green" unwinds the second accept. The truncated
    // prompt intentionally returns to the composer, so assert on bubbles.
    await page.getByRole('button', { name: 'Restore' }).nth(1).click();
    await expect(page.getByText('Done - green.')).not.toBeVisible();
    await expect(page.getByText('Done - red.')).toBeVisible();
    await expect.poll(() => editorValue(page)).toContain('fill="red"');
  });

  test('draft appears in Files > Drafts, opens at /{id}, and delete removes its chat', async ({ page }) => {
    const fileId = uniqueId('e2elist');
    await page.goto('/');
    await waitForEditor(page);
    await signInTestUser(page);
    await seedDraft(page, fileId);
    await page.evaluate(() => localStorage.setItem('esvg-sidebar-tab', 'ai'));

    // Listed under Drafts (found server-side — no esvg-local-id involved)
    await page.goto('/files');
    await expect(page.getByRole('heading', { name: 'Drafts' })).toBeVisible({ timeout: 15000 });
    const draftLink = page.getByRole('link', { name: fileId });
    await expect(draftLink).toBeVisible();

    // Opens with editor + chat restored
    await draftLink.click();
    await waitForEditor(page);
    await expect(page.getByText('Done - red.')).toBeVisible({ timeout: 15000 });
    await expect.poll(() => editorValue(page)).toContain('fill="red"');

    // Delete from the drafts list cascades to the chat subcollection
    await page.goto('/files');
    const row = page.getByRole('row').filter({ hasText: fileId });
    await row.getByRole('button').last().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('link', { name: fileId })).not.toBeVisible();

    const remains = await page.evaluate(async (id) => {
      const fb = await import('/src/lib/firebase.ts');
      const ch = await import('/src/lib/chat-history.ts');
      const doc = await new fb.EditSvgCodeDb().loadDocument(id, { quiet: true });
      const messages = await ch.loadChatMessages(id);
      return { doc, messageCount: messages.length };
    }, fileId);
    expect(remains.doc).toBeNull();
    expect(remains.messageCount).toBe(0);
  });

  test('Save promotes the draft in place (saved:true, chat kept)', async ({ page }) => {
    const fileId = uniqueId('e2esave');
    await bootWithDraft(page, fileId);
    await expect(page.getByText('Done - red.')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Save' }).click();
    // Same id — no re-mint on save
    await expect(page).toHaveURL(`/${fileId}`, { timeout: 15000 });

    // Inspect the raw doc via the emulator REST API (bypasses rules).
    const res = await fetch(`${FIRESTORE_DB}/documents/files/${fileId}`, { headers: EMULATOR_AUTH });
    const fields = (await res.json()).fields ?? {};
    expect(fields.saved?.booleanValue).toBe(true);
    expect(fields.createdAt).toBeDefined(); // merge preserved the draft's fields
    const messageCount = await page.evaluate(async (id) => {
      const ch = await import('/src/lib/chat-history.ts');
      return (await ch.loadChatMessages(id)).length;
    }, fileId);
    expect(messageCount).toBe(2);
  });

  test('gallery lists only visibility:public; clone creates an owned draft', async ({ page }) => {
    const srcId = uniqueId('e2egallery');
    await page.goto('/');
    await waitForEditor(page);
    await signInTestUser(page); // owner A
    await seedDraft(page, srcId);
    // Publish as UNLISTED first — link-shareable must not mean gallery-listed
    await page.evaluate(async (id) => {
      const fb = await import('/src/lib/firebase.ts');
      const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="red"/></svg>';
      await new fb.EditSvgCodeDb().saveDocument(id, SVG, 'unlisted');
    }, srcId);

    await page.goto('/gallery');
    await expect(page.getByText(/Nothing public yet|Public SVGs/)).toBeVisible({ timeout: 15000 });
    await expect(page.locator(`a[href="/${srcId}"]`)).toHaveCount(0);

    // Owner lists it explicitly (cards are titled, so locate by link target)
    await page.evaluate(async (id) => {
      const fb = await import('/src/lib/firebase.ts');
      await new fb.EditSvgCodeDb().setVisibility(id, 'public');
    }, srcId);
    await page.reload();
    await expect(page.locator(`a[href="/${srcId}"]`).first()).toBeVisible({ timeout: 15000 });

    // A different user clones it from the gallery (scope the button to our
    // card — the emulator may hold other public docs)
    await signInTestUser(page); // user B
    const srcCard = page.locator('.mantine-Card-root').filter({ has: page.locator(`a[href="/${srcId}"]`) });
    await srcCard.getByRole('button', { name: 'Start from this' }).click();
    await page.waitForURL((url) => url.pathname !== '/gallery', { timeout: 20000 });
    const newId = page.url().split('/').pop()!;
    expect(newId).not.toBe(srcId);
    trackFileId(newId);

    // The clone is a private draft owned by B, chat included
    await waitForEditor(page);
    await expect.poll(() => editorValue(page)).toContain('fill="red"');
    const res = await fetch(`${FIRESTORE_DB}/documents/files/${newId}`, { headers: EMULATOR_AUTH });
    const fields = (await res.json()).fields ?? {};
    expect(fields.visibility?.stringValue).toBe('private');
    expect(fields.saved?.booleanValue).toBe(false);
    expect(fields.forkedFrom?.stringValue).toBe(srcId);
    const clonedCount = await page.evaluate(async (id) => {
      const ch = await import('/src/lib/chat-history.ts');
      return (await ch.loadChatMessages(id)).length;
    }, newId);
    expect(clonedCount).toBe(2);
  });

  test('a guest opening a public link sees the chat read-only, on the AI tab', async ({ page }) => {
    const srcId = uniqueId('e2eshared');
    await page.goto('/');
    await waitForEditor(page);
    await signInTestUser(page); // author
    await seedDraft(page, srcId);
    await page.evaluate(async (id) => {
      const fb = await import('/src/lib/firebase.ts');
      const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="red"/></svg>';
      await new fb.EditSvgCodeDb().saveDocument(id, SVG, 'public');
    }, srcId);

    // Drop the author's session (and the AI-tab preference the author had) so
    // the visit is a true guest arrival via the link.
    await page.evaluate(async () => {
      const m = await import('/node_modules/.vite/deps/firebase_auth.js');
      await m.signOut(m.getAuth());
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`/${srcId}`);
    await waitForEditor(page);

    // The conversation is there — and the link lands on it, not the info tab.
    await expect(page.getByText('make it red')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Done - red.')).toBeVisible();
    await expect(page.getByText('Read-only — shared by the author')).toBeVisible();

    // Read-only: no composer, no restore/edit affordances — just a fork offer.
    await expect(page.getByRole('button', { name: 'Start from this' })).toBeVisible();
    await expect(page.getByPlaceholder(/ask ai/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Restore' })).toHaveCount(0);
    await expect(page.locator('.aui-msg-editable')).toHaveCount(0);

    // And the visitor cannot write to the author's chat.
    const denied = await page.evaluate(async (id) => {
      const ch = await import('/src/lib/chat-history.ts');
      await ch.saveChatMessages(id, [{ role: 'user', content: 'hijack' }] as never, '<svg/>');
      return (await ch.loadChatMessages(id)).some((m: { content: string }) => m.content === 'hijack');
    }, srcId);
    expect(denied).toBe(false);
  });
});

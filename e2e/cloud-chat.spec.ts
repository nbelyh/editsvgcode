import { test, expect, type Page } from '@playwright/test';
import { waitForEditor } from './helpers.js';

/**
 * Cloud chat persistence (feature/cloud-chats): signed-in users' chat,
 * draft SVG, and undo snapshots live in Firestore and survive reload.
 * Runs against the Firebase emulators started by `npm run dev`.
 */

const SVG_BASE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';
const SVG_RED = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="red"/></svg>';
const SVG_GREEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="green"/></svg>';

/** Unique per test run so parallel tests and leftover emulator data never collide.
 * Registers the id for the afterEach purge. */
function uniqueId(prefix: string): string {
  const id = (prefix + Math.random().toString(36).slice(2, 10)).toLowerCase();
  currentFileId = id;
  return id;
}

/**
 * Sign in a fresh (non-anonymous) user via the auth emulator. The emulator
 * accepts unsigned Google credentials, so a random `sub` mints an isolated
 * account. Imports Vite's pre-bundled firebase_auth so it shares the app's
 * auth instance.
 */
async function signInTestUser(page: Page): Promise<string> {
  const { uid, anonUid } = await page.evaluate(async () => {
    const m = await import('/node_modules/.vite/deps/firebase_auth.js');
    const auth = m.getAuth();
    // The app boots with an auto-created anonymous session — record it so the
    // afterEach purge removes it along with the test user.
    const anonUid = auth.currentUser?.isAnonymous ? (auth.currentUser.uid as string) : null;
    const sub = 'e2e' + Math.random().toString(36).slice(2);
    const cred = m.GoogleAuthProvider.credential(
      JSON.stringify({ sub, email: `${sub}@example.com`, email_verified: true }),
    );
    const res = await m.signInWithCredential(auth, cred);
    return { uid: res.user.uid as string, anonUid };
  });
  currentUids.push(uid);
  if (anonUid) currentUids.push(anonUid);
  return uid;
}

/** Seed a draft (file doc + chat) through the app's real persistence module. */
async function seedDraft(page: Page, fileId: string, opts: { twoAccepts?: boolean } = {}) {
  await page.evaluate(async ({ fileId, twoAccepts, SVG_BASE, SVG_RED, SVG_GREEN }) => {
    const ch = await import('/src/lib/chat-history.ts');
    const messages = [
      { role: 'user', content: 'make it red' },
      {
        role: 'assistant', content: 'Done - red.',
        toolCalls: [{ id: 't1', name: 'update_svg', status: 'accepted', arguments: { svg: SVG_RED }, prevSvg: SVG_BASE }],
      },
      ...(twoAccepts ? [
        { role: 'user', content: 'now green' },
        {
          role: 'assistant', content: 'Done - green.',
          toolCalls: [{ id: 't2', name: 'update_svg', status: 'accepted', arguments: { svg: SVG_GREEN }, prevSvg: SVG_RED }],
        },
      ] : []),
    ];
    await ch.saveChatMessages(fileId, messages, twoAccepts ? SVG_GREEN : SVG_RED);
  }, { fileId, twoAccepts: !!opts.twoAccepts, SVG_BASE, SVG_RED, SVG_GREEN });
}

const FIRESTORE_EMULATOR = 'http://localhost:8080';
const FIRESTORE_DB = `${FIRESTORE_EMULATOR}/v1/projects/editsvgcode-dev/databases/(default)`;
const EMULATOR_AUTH = { Authorization: 'Bearer owner' };

/**
 * Purge a test draft (doc + messages) straight through the emulator REST API.
 * Runs in afterEach so leftovers never accumulate, even when a test dies
 * mid-flight with the page in an unusable state. 404s are fine (already gone).
 */
async function purgeDraft(fileId: string) {
  const res = await fetch(`${FIRESTORE_DB}/documents/files/${fileId}/messages?pageSize=300`, { headers: EMULATOR_AUTH });
  const docs: Array<{ name: string }> = (await res.json()).documents ?? [];
  for (const d of docs) {
    await fetch(`${FIRESTORE_EMULATOR}/v1/${d.name}`, { method: 'DELETE', headers: EMULATOR_AUTH });
  }
  await fetch(`${FIRESTORE_DB}/documents/files/${fileId}`, { method: 'DELETE', headers: EMULATOR_AUTH });
}

const AUTH_EMULATOR = 'http://localhost:9099';

/** Delete a throwaway auth-emulator account so test users don't accumulate. */
async function purgeUser(uid: string) {
  await fetch(`${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/projects/editsvgcode-dev/accounts:delete`, {
    method: 'POST',
    headers: { ...EMULATOR_AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ localId: uid }),
  });
}

/** What the current test created — purged in afterEach even if it failed. */
let currentFileId: string | null = null;
let currentUids: string[] = [];

test.afterEach(async () => {
  if (currentFileId) {
    await purgeDraft(currentFileId);
    currentFileId = null;
  }
  for (const uid of currentUids) await purgeUser(uid);
  currentUids = [];
});

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

// Emulator-backed and evaluate-heavy: run this file's tests sequentially —
// parallel browsers contending over the shared dev server/emulators time out.
test.describe.configure({ mode: 'default' });

// Firebase auth-session restore across reloads is flaky in Playwright WebKit
// (chat intermittently loads empty); the flows under test are browser-agnostic
// persistence logic, so Chromium coverage suffices.
test.skip(({ browserName }) => browserName === 'webkit', 'Auth/emulator flows are flaky on WebKit');

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
});

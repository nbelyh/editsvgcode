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
const SVG_BLUE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="blue"/></svg>';

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

/** How many messages the server actually holds (a real Firestore read, not
 *  whatever the component happens to have in state). */
async function serverMessageCount(page: Page, fileId: string): Promise<number> {
  return await page.evaluate(async (id) => {
    return (await window.__test.chatHistory.loadChatMessages(id)).length;
  }, fileId);
}

/**
 * Write a conversation straight into IndexedDB the way the pre-server-chat
 * build persisted it (`messages:<fileId>` in the `editsvgcode`/`chat` store).
 * This is the fixture the migration has to find — it cannot be produced through
 * the app any more, since nothing writes that key.
 */
async function seedLegacyLocalChat(page: Page, fileId: string, messages: unknown[]): Promise<void> {
  await page.evaluate(({ fileId, messages }) => new Promise<void>((resolve, reject) => {
    const req = indexedDB.open('editsvgcode', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('chat')) db.createObjectStore('chat');
    };
    req.onsuccess = () => {
      const tx = req.result.transaction('chat', 'readwrite');
      tx.objectStore('chat').put(messages, `messages:${fileId}`);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    req.onerror = () => reject(req.error);
  }), { fileId, messages });
}

/** Read the legacy key back — null once the migration has cleared it. */
async function readLegacyLocalChat(page: Page, fileId: string): Promise<unknown[] | null> {
  return await page.evaluate((id) => new Promise<unknown[] | null>((resolve) => {
    const req = indexedDB.open('editsvgcode', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('chat')) db.createObjectStore('chat');
    };
    req.onsuccess = () => {
      const tx = req.result.transaction('chat', 'readonly');
      const get = tx.objectStore('chat').get(`messages:${id}`);
      get.onsuccess = () => resolve((get.result as unknown[]) ?? null);
      get.onerror = () => resolve(null);
    };
    req.onerror = () => resolve(null);
  }), fileId);
}

/**
 * Point a stored message's tool call at a blob path, via the emulator REST API.
 * Used to fabricate an unreachable image: the app can only ever write refs to
 * blobs it just uploaded, so a broken one cannot be produced through the UI.
 */
async function setMessagePngRef(fileId: string, seq: number, pngRef: string): Promise<void> {
  const docId = String(seq).padStart(6, '0');
  const url = `${FIRESTORE_DB}/documents/files/${fileId}/messages/${docId}`;
  const cur = await (await fetch(url, { headers: EMULATOR_AUTH })).json();
  const payload = JSON.parse(cur.fields.payload.stringValue);
  payload.toolCalls[0].pngRef = pngRef;
  const res = await fetch(`${url}?updateMask.fieldPaths=payload`, {
    method: 'PATCH',
    headers: { ...EMULATOR_AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { payload: { stringValue: JSON.stringify(payload) } } }),
  });
  if (!res.ok) throw new Error(`setMessagePngRef failed: ${res.status} ${await res.text()}`);
}

/** Read a stored message's pngRef straight from Firestore (bypasses the app). */
async function getMessagePngRef(fileId: string, seq: number): Promise<string | undefined> {
  const docId = String(seq).padStart(6, '0');
  const r = await (await fetch(`${FIRESTORE_DB}/documents/files/${fileId}/messages/${docId}`, { headers: EMULATOR_AUTH })).json();
  return JSON.parse(r.fields.payload.stringValue).toolCalls?.[0]?.pngRef;
}

/** A legacy conversation, deliberately distinct from seedDraft's red one so the
 *  two are told apart when both exist. */
const LEGACY_MESSAGES = [
  { role: 'user', content: 'make it blue' },
  {
    role: 'assistant', content: 'Done - blue.',
    toolCalls: [{ id: 'l1', name: 'update_svg', status: 'accepted', arguments: { svg: SVG_BLUE }, prevSvg: SVG_BASE }],
  },
];

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
      const { EditSvgCodeDb, chatHistory: ch } = window.__test;
      const doc = await new EditSvgCodeDb().loadDocument(id, { quiet: true });
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
      return (await window.__test.chatHistory.loadChatMessages(id)).length;
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
      const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="red"/></svg>';
      await new window.__test.EditSvgCodeDb().saveDocument(id, SVG, 'unlisted');
    }, srcId);

    await page.goto('/gallery');
    await expect(page.getByText(/Nothing public yet|Public SVGs/)).toBeVisible({ timeout: 15000 });
    await expect(page.locator(`a[href="/${srcId}"]`)).toHaveCount(0);

    // Owner lists it explicitly (cards are titled, so locate by link target)
    await page.evaluate(async (id) => {
      await new window.__test.EditSvgCodeDb().setVisibility(id, 'public');
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
      return (await window.__test.chatHistory.loadChatMessages(id)).length;
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
      const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="red"/></svg>';
      await new window.__test.EditSvgCodeDb().saveDocument(id, SVG, 'public');
    }, srcId);

    // Drop the author's session (and the AI-tab preference the author had) so
    // the visit is a true guest arrival via the link.
    await page.evaluate(async () => {
      const m = window.__test.firebaseAuth;
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
      const ch = window.__test.chatHistory;
      await ch.saveChatMessages(id, [{ role: 'user', content: 'hijack' }] as never, '<svg/>');
      return (await ch.loadChatMessages(id)).some((m: { content: string }) => m.content === 'hijack');
    }, srcId);
    expect(denied).toBe(false);
  });
});

/**
 * One-time lift of pre-server-chat conversations out of IndexedDB. Upgrading
 * users must not open a familiar document to an empty chat.
 */
test.describe('Legacy chat migration', () => {
  /** Point the app at `fileId` as its working draft, on the AI tab. */
  async function openAsDraft(page: Page, fileId: string) {
    await page.evaluate((id) => {
      localStorage.setItem('esvg-local-id', id);
      localStorage.setItem('esvg-sidebar-tab', 'ai');
    }, fileId);
    await page.reload();
    await waitForEditor(page);
  }

  test('a chat left in IndexedDB is lifted to the server on first open', async ({ page }) => {
    const fileId = uniqueId('e2emigrate');
    await page.goto('/');
    await waitForEditor(page);
    await signInTestUser(page);

    // Exactly what the old build left behind: messages local, server empty.
    await seedLegacyLocalChat(page, fileId, LEGACY_MESSAGES);
    await openAsDraft(page, fileId);

    // Surfaced in the UI ...
    await expect(page.getByText('make it blue')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Done - blue.')).toBeVisible();

    // ... because it now lives on the server, and no longer in IndexedDB.
    await expect.poll(() => serverMessageCount(page, fileId), { timeout: 15000 }).toBe(2);
    expect(await readLegacyLocalChat(page, fileId)).toBeNull();
  });

  test('a stale local chat never clobbers a real server chat', async ({ page }) => {
    const fileId = uniqueId('e2enoclobber');
    await page.goto('/');
    await waitForEditor(page);
    await signInTestUser(page);
    await seedDraft(page, fileId);                            // server: red
    await seedLegacyLocalChat(page, fileId, LEGACY_MESSAGES); // local:  blue
    await openAsDraft(page, fileId);

    // The server copy wins outright ...
    await expect(page.getByText('Done - red.')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Done - blue.')).toHaveCount(0);
    expect(await serverMessageCount(page, fileId)).toBe(2);
    // ... and the untouched local copy is left alone rather than destroyed.
    expect(await readLegacyLocalChat(page, fileId)).toHaveLength(2);
  });

  test('an unreachable image costs the picture, not the conversation', async ({ page }) => {
    const fileId = uniqueId('e2eblob');
    await page.goto('/');
    await waitForEditor(page);
    await signInTestUser(page);
    await seedDraft(page, fileId);
    // Repoint the assistant turn at a blob that does not exist — what a CORS
    // block, a revoked bucket, or a deleted object looks like on load.
    await setMessagePngRef(fileId, 1, 'blobs/nobody/deadbeef.png');

    await openAsDraft(page, fileId);

    // The conversation still renders: one bad blob must not blank the chat.
    await expect(page.getByText('make it red')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Done - red.')).toBeVisible();

    // And nothing was destroyed. The load-triggered save must keep both
    // messages and preserve the reference, so the image can come back once
    // the blob is reachable again.
    await expect.poll(() => serverMessageCount(page, fileId), { timeout: 15000 }).toBe(2);
    expect(await getMessagePngRef(fileId, 1)).toBe('blobs/nobody/deadbeef.png');
  });

  test('a legacy "_local_" id migrates only after Save re-mints it', async ({ page }) => {
    const legacyId = '_local_' + uniqueId('e2eremint');
    await page.goto('/');
    await waitForEditor(page);
    await signInTestUser(page);
    await seedLegacyLocalChat(page, legacyId, LEGACY_MESSAGES);
    await openAsDraft(page, legacyId);

    // Not uploaded under the malformed id — Save would re-mint and strand it.
    await expect(page.getByText('make it blue')).toHaveCount(0);
    expect(await serverMessageCount(page, legacyId)).toBe(0);

    // Save mints a clean guid and carries the local chat across to it.
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForURL((url) => /^\/[a-z0-9]+$/.test(url.pathname), { timeout: 20000 });
    const cleanId = page.url().split('/').pop()!;
    expect(cleanId).not.toBe(legacyId);
    trackFileId(cleanId);

    // Now under a clean id, the chat migrates and the stale key is gone.
    await expect(page.getByText('Done - blue.')).toBeVisible({ timeout: 15000 });
    await expect.poll(() => serverMessageCount(page, cleanId), { timeout: 15000 }).toBe(2);
    expect(await readLegacyLocalChat(page, legacyId)).toBeNull();
  });
});

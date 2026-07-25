import { test, expect, type Page } from '@playwright/test';
import { waitForEditor } from './helpers.js';
import {
  FIRESTORE_DB, EMULATOR_AUTH,
  uniqueId, signInTestUser, seedChat, seedRawDoc, readRawDoc, useEmulatorSuite,
} from './emulator.js';

/**
 * Gallery cards (feature/cloud-chats): publishing goes through the publish
 * dialog (title/description prefilled from the chat prompt), cards show the
 * author, and legacy docs never leak into the gallery.
 * Runs against the Firebase emulators started by `npm run dev`.
 */

const SVG_RED = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="red"/></svg>';
const AUTHOR_NAME = 'E2E Author';

/** The gallery card link for a given file id (the title Anchor; the thumbnail
 * link shares the same href, so scope by both href and text). */
function galleryCard(page: Page, fileId: string, title: string) {
  return page.locator(`a[href="/${fileId}"]`).filter({ hasText: title });
}

/** Seed a saved-but-unpublished draft with a one-line chat prompt. */
async function seedDraft(page: Page, fileId: string) {
  await seedChat(page, fileId, [
    { role: 'user', content: 'draw a red square for me' },
    { role: 'assistant', content: 'Done - red.' },
  ], SVG_RED);
}

useEmulatorSuite();

test.describe('Gallery publish dialog and cards', () => {
  test('publish via dialog: chat-prompt prefill, author on card, edit gallery info', async ({ page }) => {
    const fileId = uniqueId('e2epub');
    await page.goto('/');
    await waitForEditor(page);
    await signInTestUser(page, AUTHOR_NAME);
    await seedDraft(page, fileId);
    await page.evaluate((id) => {
      localStorage.setItem('esvg-local-id', id);
    }, fileId);
    await page.reload();
    await waitForEditor(page);

    // Save the draft so the Share menu (routeFileId) appears
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(`/${fileId}`, { timeout: 15000 });

    // Share → "Publish to gallery…" opens the dialog (nothing written yet)
    await page.getByRole('button', { name: 'Share' }).click();
    await page.getByRole('menuitem', { name: 'Publish to gallery…' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Prefilled from the first chat prompt ("draw a red square for me")
    await expect(dialog.getByLabel('Title')).toHaveValue('Red square for me', { timeout: 10000 });
    await expect(dialog.getByLabel('Description')).toHaveValue('draw a red square for me');

    // The user edits the title, then confirms
    await dialog.getByLabel('Title').fill('Red Square');
    await dialog.getByRole('button', { name: 'Publish' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Listed in the public gallery')).toBeVisible();

    // The card shows title, description and author — scoped to this card's href
    // so leftover public docs from a prior run can't collide.
    await page.goto('/gallery');
    const card = galleryCard(page, fileId, 'Red Square');
    await expect(card).toBeVisible({ timeout: 15000 });
    const cardRoot = page.locator('.mantine-Card-root').filter({ has: card });
    await expect(cardRoot.getByText('draw a red square for me')).toBeVisible();
    await expect(cardRoot.getByText(AUTHOR_NAME)).toBeVisible();

    // The doc carries the author stamp (raw check bypassing rules)
    const fields = await readRawDoc(fileId);
    expect(fields.visibility?.stringValue).toBe('public');
    expect(fields.title?.stringValue).toBe('Red Square');
    expect(fields.authorName?.stringValue).toBe(AUTHOR_NAME);

    // "Edit gallery info…" from the Files page updates the card, not visibility
    await page.goto('/files');
    const row = page.getByRole('row').filter({ hasText: 'Red Square' });
    await row.getByRole('button').first().click();
    await page.getByRole('menuitem', { name: 'Edit gallery info…' }).click();
    const editDialog = page.getByRole('dialog');
    await expect(editDialog.getByLabel('Title')).toHaveValue('Red Square');
    await editDialog.getByLabel('Title').fill('Crimson Square');
    await editDialog.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Gallery info updated')).toBeVisible();

    await page.goto('/gallery');
    await expect(galleryCard(page, fileId, 'Crimson Square')).toBeVisible({ timeout: 15000 });
  });

  test('legacy docs never appear in the gallery; missing title falls back to Untitled', async ({ page }) => {
    // Legacy prod doc: only the `private` boolean, no `visibility` field.
    // Link-shareable ("unlisted") — must NOT be gallery-listed.
    const legacyId = uniqueId('e2elegacy');
    await seedRawDoc(legacyId, {
      text: { stringValue: SVG_RED },
      private: { booleanValue: false },
      saved: { booleanValue: true },
      uid: { stringValue: 'legacy-owner' },
      modified: { timestampValue: new Date().toISOString() },
    });

    // Explicitly public doc without title/author (e.g. published by old client)
    const untitledId = uniqueId('e2euntitled');
    await seedRawDoc(untitledId, {
      text: { stringValue: SVG_RED },
      visibility: { stringValue: 'public' },
      private: { booleanValue: false },
      saved: { booleanValue: true },
      uid: { stringValue: 'some-owner' },
      modified: { timestampValue: new Date().toISOString() },
    });

    await page.goto('/gallery');
    // Scoped by href — other (leftover) untitled public docs may exist too.
    await expect(page.locator(`a[href="/${untitledId}"]`).filter({ hasText: 'Untitled' })).toBeVisible({ timeout: 15000 });
    // The legacy doc is nowhere on the page
    await expect(page.locator(`a[href="/${legacyId}"]`)).toHaveCount(0);
  });

  test('security rules reject oversized title and non-https author photo', async ({ page }) => {
    const fileId = uniqueId('e2erules');
    await page.goto('/');
    await waitForEditor(page);
    await signInTestUser(page, AUTHOR_NAME);
    // Owner creates a saved doc; grab their real ID token so REST writes are
    // rules-enforced (unlike the `Bearer owner` admin token used elsewhere).
    const idToken = await page.evaluate(async ({ id, svg }) => {
      await new window.__test.EditSvgCodeDb().saveDocument(id, svg, 'unlisted');
      const user = window.__test.firebaseAuth.getAuth().currentUser;
      if (!user) throw new Error('expected a signed-in user after signInTestUser');
      return user.getIdToken();
    }, { id: fileId, svg: SVG_RED });

    // PATCH as the owner via REST, bypassing the UI cap. Rules must deny an
    // oversized title and a non-https authorPhoto beacon, but allow valid ones.
    const patch = async (fields: Record<string, unknown>) => {
      const mask = Object.keys(fields).map((k) => `updateMask.fieldPaths=${k}`).join('&');
      const res = await fetch(`${FIRESTORE_DB}/documents/files/${fileId}?${mask}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });
      return res.status;
    };

    expect(await patch({ visibility: { stringValue: 'public' }, title: { stringValue: 'x'.repeat(5000) } })).toBe(403);
    expect(await patch({ visibility: { stringValue: 'public' }, authorPhoto: { stringValue: 'http://evil.example/beacon.png' } })).toBe(403);
    expect(await patch({ visibility: { stringValue: 'public' }, title: { stringValue: 'Fine Title' }, authorPhoto: { stringValue: 'https://example.com/a.png' } })).toBe(200);
  });
});

import { test, type Page } from '@playwright/test';

/**
 * Shared Firebase-emulator harness for the emulator-backed e2e specs
 * (cloud-chat, gallery). Runs against the emulators started by `npm run dev`
 * under project `editsvgcode-dev`; REST admin access uses `Bearer owner`.
 */

export const FIRESTORE_EMULATOR = 'http://localhost:8080';
export const FIRESTORE_DB = `${FIRESTORE_EMULATOR}/v1/projects/editsvgcode-dev/databases/(default)`;
export const EMULATOR_AUTH = { Authorization: 'Bearer owner' };
export const AUTH_EMULATOR = 'http://localhost:9099';

// What the current test created — purged in afterEach even if it failed.
const createdFileIds: string[] = [];
const createdUids: string[] = [];

/** Unique per run so parallel tests and leftover emulator data never collide;
 * registers the id for the afterEach purge. */
export function uniqueId(prefix: string): string {
  const id = (prefix + Math.random().toString(36).slice(2, 10)).toLowerCase();
  createdFileIds.push(id);
  return id;
}

/** Register an externally-created id (e.g. a clone) for cleanup. */
export function trackFileId(id: string): void {
  createdFileIds.push(id);
}

/**
 * Sign in a fresh (non-anonymous) user via the auth emulator, which accepts
 * unsigned Google credentials, so a random `sub` mints an isolated account.
 * Pass `displayName` to set the profile name (updateProfile covers emulators
 * that don't map the `name` claim). Goes through `window.__test` so it drives
 * the app's own auth instance — the live session, not a second client.
 */
export async function signInTestUser(page: Page, displayName?: string): Promise<string> {
  const { uid, anonUid } = await page.evaluate(async (name) => {
    const m = window.__test.firebaseAuth;
    const auth = m.getAuth();
    // The app boots with an auto-created anonymous session — record it so the
    // afterEach purge removes it along with the test user.
    const anonUid = auth.currentUser?.isAnonymous ? (auth.currentUser.uid as string) : null;
    const sub = 'e2e' + Math.random().toString(36).slice(2);
    const claims: Record<string, unknown> = { sub, email: `${sub}@example.com`, email_verified: true };
    if (name) claims.name = name;
    const cred = m.GoogleAuthProvider.credential(JSON.stringify(claims));
    const res = await m.signInWithCredential(auth, cred);
    if (name && !res.user.displayName) await m.updateProfile(res.user, { displayName: name });
    return { uid: res.user.uid as string, anonUid };
  }, displayName ?? null);
  createdUids.push(uid);
  if (anonUid) createdUids.push(anonUid);
  return uid;
}

/** Seed a chat (file doc + messages) through the app's real persistence module. */
export async function seedChat(page: Page, fileId: string, messages: unknown[], svg: string): Promise<void> {
  await page.evaluate(async ({ fileId, messages, svg }) => {
    await window.__test.chatHistory.saveChatMessages(fileId, messages as never, svg);
  }, { fileId, messages, svg });
}

/** Create a files/{id} doc straight through the emulator REST API (bypasses
 * rules) — used to fabricate legacy/foreign docs the app itself can't write. */
export async function seedRawDoc(id: string, fields: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${FIRESTORE_DB}/documents/files?documentId=${id}`, {
    method: 'POST',
    headers: { ...EMULATOR_AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`seedRawDoc(${id}) failed: ${res.status} ${await res.text()}`);
}

/** Read a files/{id} doc's raw fields via the emulator REST API (bypasses rules). */
export async function readRawDoc(id: string): Promise<Record<string, { stringValue?: string; booleanValue?: boolean; integerValue?: string }>> {
  const res = await fetch(`${FIRESTORE_DB}/documents/files/${id}`, { headers: EMULATOR_AUTH });
  return (await res.json()).fields ?? {};
}

/** Purge a test doc (incl. chat subcollection) via the emulator REST API.
 * 404s are fine (already gone). */
async function purgeDraft(fileId: string): Promise<void> {
  const res = await fetch(`${FIRESTORE_DB}/documents/files/${fileId}/messages?pageSize=300`, { headers: EMULATOR_AUTH });
  const docs: Array<{ name: string }> = (await res.json()).documents ?? [];
  for (const d of docs) {
    await fetch(`${FIRESTORE_EMULATOR}/v1/${d.name}`, { method: 'DELETE', headers: EMULATOR_AUTH });
  }
  await fetch(`${FIRESTORE_DB}/documents/files/${fileId}`, { method: 'DELETE', headers: EMULATOR_AUTH });
}

/** Delete a throwaway auth-emulator account so test users don't accumulate. */
async function purgeUser(uid: string): Promise<void> {
  await fetch(`${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/projects/editsvgcode-dev/accounts:delete`, {
    method: 'POST',
    headers: { ...EMULATOR_AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ localId: uid }),
  });
}

/**
 * Install the shared afterEach purge and the emulator-suite run constraints
 * (sequential — parallel browsers contend over the shared dev server; WebKit
 * auth-session restore is flaky). Call once at the top of an emulator spec.
 */
export function useEmulatorSuite(): void {
  test.describe.configure({ mode: 'default' });
  test.skip(({ browserName }) => browserName === 'webkit', 'Auth/emulator flows are flaky on WebKit');
  test.afterEach(async () => {
    for (const id of createdFileIds.splice(0)) await purgeDraft(id);
    for (const uid of createdUids.splice(0)) await purgeUser(uid);
  });
}

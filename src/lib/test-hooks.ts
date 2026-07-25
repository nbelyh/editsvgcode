/**
 * Dev-only bridge to the app's own module instances, for the e2e specs.
 *
 * `page.evaluate` bodies run in the BROWSER, so they can't use anything the
 * spec imported in Node — a Node-side Firebase would be a second client with
 * no session and no connection to the app under test. The specs therefore need
 * the page's own instances: the live auth session, and the real persistence
 * functions (so fixtures are written through the production code path).
 *
 * Publishing them here lets a spec write `window.__test.chatHistory.…` instead
 * of importing the URL Vite serves the module at. That URL is rooted (`/src/…`),
 * which TypeScript reads as an absolute *disk* path and cannot find — hence the
 * TS2307s those imports used to raise. A plain property read has nothing to
 * resolve, and `e2e/global.d.ts` types it from `TestHooks` below.
 *
 * Same shape as the `__test_monaco_editor` hook in Editor.tsx. Guarded by
 * `import.meta.env.DEV`, which Vite replaces with `false` in production, so the
 * assignment is dead code there.
 */
import * as firebaseAuth from 'firebase/auth';
import * as chatHistory from './chat-history';
import { EditSvgCodeDb } from './firebase';

export interface TestHooks {
  /** The app's Firebase auth module — `getAuth()` returns the live session. */
  firebaseAuth: typeof firebaseAuth;
  /** Server-side chat persistence, used to seed and assert on fixtures. */
  chatHistory: typeof chatHistory;
  /** Document CRUD (save, visibility, gallery listing). */
  EditSvgCodeDb: typeof EditSvgCodeDb;
}

export function installTestHooks(): void {
  if (!import.meta.env.DEV) return;
  (window as unknown as { __test: TestHooks }).__test = {
    firebaseAuth,
    chatHistory,
    EditSvgCodeDb,
  };
}

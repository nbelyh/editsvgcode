import type { TestHooks } from '../src/lib/test-hooks';

/**
 * The dev-only bridge the app publishes (see src/lib/test-hooks.ts). Declared
 * non-optional because the specs only ever run against the dev server, where
 * it is always installed — so `window.__test.chatHistory.…` type-checks
 * directly, with the app's real signatures.
 */
declare global {
  interface Window {
    __test: TestHooks;
  }
}

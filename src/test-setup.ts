import '@testing-library/jest-dom/vitest';

// Runtime config normally arrives from /config.js before the bundle, so modules
// that read it at import time (api-client, firebase) explode in jsdom without a
// stand-in — and only when a test happens to pull one in, which made the
// failure look intermittent. Values are inert: nothing here should reach a
// network, and tests that need real behaviour mock the module instead.
if (typeof window !== 'undefined' && !(window as unknown as { __CONFIG__?: unknown }).__CONFIG__) {
  (window as unknown as { __CONFIG__: Record<string, string> }).__CONFIG__ = {
    FIREBASE_API_KEY: 'test',
    FIREBASE_AUTH_DOMAIN: 'localhost',
    FIREBASE_DATABASE_URL: 'http://localhost:0',
    FIREBASE_PROJECT_ID: 'test',
    FIREBASE_STORAGE_BUCKET: 'test',
    FIREBASE_MESSAGING_SENDER_ID: '0',
    FIREBASE_APP_ID: 'test',
    FIREBASE_MEASUREMENT_ID: 'test',
    API_URL: 'http://localhost:0',
  };
}

// Polyfill window.matchMedia for Mantine in jsdom
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
}

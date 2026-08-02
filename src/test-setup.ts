/// <reference types="@testing-library/jest-dom/vitest" />
import { expect } from 'vitest';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

// Register the matchers against THIS vitest instance rather than importing
// '@testing-library/jest-dom/vitest', whose entry is CJS and does its own
// `require('vitest')`. Vite's dep optimizer picks the require condition
// depending on cache state, and when it does, that `require` yields a second,
// half-initialized vitest module: `expect` exists but its chai binding does
// not, so `expect.extend` dies with "Cannot read properties of undefined
// (reading 'config')" — in the SETUP file, which fails every test file at once
// while any single file run on its own passes. That is what made it look
// random rather than broken.
expect.extend(jestDomMatchers);

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

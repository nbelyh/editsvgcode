/** Runtime config loaded from /config.js (not baked into the build). */

interface AppConfig {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_DATABASE_URL: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_MEASUREMENT_ID: string;
  API_URL: string;
}

declare global {
  interface Window {
    __CONFIG__: AppConfig;
  }
}

export const config: AppConfig = typeof window !== 'undefined'
  ? window.__CONFIG__
  // No runtime config outside a browser — it arrives from /config.js, and a
  // build-time render has no page to have loaded it. Throwing on read rather
  // than handing back an empty object: api-client and image-gen capture
  // API_URL at module scope, so a server-rendered page that pulled either in
  // would bake `undefined` into a request URL and say nothing about it. This
  // way the build is where that gets found, which is the whole point of doing
  // the render at build time.
  : new Proxy({} as AppConfig, {
      get(_target, key) {
        throw new Error(
          `config.${String(key)} was read outside a browser. Runtime config comes ` +
          'from /config.js, which only exists in a page; a module rendered at ' +
          'build time must not depend on it.',
        );
      },
    });

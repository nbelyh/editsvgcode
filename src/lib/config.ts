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

export const config: AppConfig = window.__CONFIG__;

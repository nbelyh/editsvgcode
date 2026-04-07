// Runtime environment config — swapped at deploy time, not baked into the build.
// Local dev defaults (uses Firebase emulators on localhost).
window.__CONFIG__ = {
  FIREBASE_API_KEY: 'local-dev-key',
  FIREBASE_AUTH_DOMAIN: 'localhost',
  FIREBASE_DATABASE_URL: 'http://localhost:8080',
  FIREBASE_PROJECT_ID: 'local-dev',
  FIREBASE_STORAGE_BUCKET: '',
  FIREBASE_MESSAGING_SENDER_ID: '',
  FIREBASE_APP_ID: 'local-dev',
  FIREBASE_MEASUREMENT_ID: '',
  API_URL: 'http://localhost:7071',
};

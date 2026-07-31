/**
 * Shared plumbing for gallery-export / gallery-import.
 *
 * Talks to Firestore and Storage over their REST APIs so the scripts need no
 * npm dependency of their own — auth is whatever `gcloud` is already logged in
 * as (the same credentials used to administer the projects), or the emulator's
 * `Bearer owner`. That keeps a second service-account key out of the picture.
 *
 * Environments come from the runtime config files so project ids and bucket
 * names have exactly one source of truth.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

/** Evaluate a `window.__CONFIG__ = {...}` config file without a browser. */
function readRuntimeConfig(relPath) {
  const src = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  const window = {};
  new Function('window', src)(window);
  return window.__CONFIG__;
}

const ENVS = {
  dev: { config: 'public/config.js', emulator: true },
  beta: { config: 'config/config.beta.js', emulator: false },
  prod: { config: 'config/config.prod.js', emulator: false },
};

let cachedToken = null;
function gcloudToken() {
  if (!cachedToken) {
    cachedToken = execFileSync('gcloud', ['auth', 'print-access-token'], {
      encoding: 'utf8', shell: true,
    }).trim();
  }
  return cachedToken;
}

/**
 * Resolve an environment name to everything the callers need: REST base URLs,
 * auth headers, project id and bucket.
 */
function resolveEnv(name) {
  const env = ENVS[name];
  if (!env) throw new Error(`Unknown environment '${name}'. Use one of: ${Object.keys(ENVS).join(', ')}`);
  const cfg = readRuntimeConfig(env.config);
  const project = cfg.FIREBASE_PROJECT_ID;
  const bucket = cfg.FIREBASE_STORAGE_BUCKET;
  if (!project) throw new Error(`${env.config} has no FIREBASE_PROJECT_ID`);
  if (!bucket) throw new Error(`${env.config} has no FIREBASE_STORAGE_BUCKET`);

  if (env.emulator) {
    return {
      name, project, bucket, emulator: true,
      firestore: `http://localhost:8080/v1/projects/${project}/databases/(default)`,
      storageDownload: (p) => `http://localhost:9199/v0/b/${bucket}/o/${encodeURIComponent(p)}?alt=media`,
      storageUpload: (p) => `http://localhost:9199/v0/b/${bucket}/o?name=${encodeURIComponent(p)}`,
      headers: () => ({ Authorization: 'Bearer owner' }),
    };
  }
  return {
    name, project, bucket, emulator: false,
    firestore: `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)`,
    storageDownload: (p) => `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(p)}?alt=media`,
    storageUpload: (p) => `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(p)}`,
    headers: () => ({ Authorization: `Bearer ${gcloudToken()}`, 'x-goog-user-project': project }),
  };
}

// ---------------------------------------------------------------------------
// Firestore REST value mapping — only the field types these documents use.
// ---------------------------------------------------------------------------

function decodeValue(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('timestampValue' in v) return { __ts: v.timestampValue };
  if ('nullValue' in v) return null;
  if ('mapValue' in v) return decodeFields(v.mapValue.fields || {});
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeValue);
  return undefined;
}

function decodeFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) out[k] = decodeValue(v);
  return out;
}

function encodeValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'object' && v.__ts) return { timestampValue: v.__ts };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  if (typeof v === 'object') return { mapValue: { fields: encodeFields(v) } };
  throw new Error(`Cannot encode value: ${String(v)}`);
}

function encodeFields(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[k] = encodeValue(v);
  }
  return out;
}

// ---------------------------------------------------------------------------
// REST helpers
// ---------------------------------------------------------------------------

async function req(url, opts, what) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${what} failed: ${res.status} ${(await res.text()).slice(0, 400)}`);
  return res;
}

/** Every document in a collection, following pagination. */
async function listDocs(env, collectionPath) {
  const docs = [];
  let pageToken;
  do {
    const u = new URL(`${env.firestore}/documents/${collectionPath}`);
    u.searchParams.set('pageSize', '300');
    if (pageToken) u.searchParams.set('pageToken', pageToken);
    const body = await (await req(u, { headers: env.headers() }, `list ${collectionPath}`)).json();
    for (const d of body.documents || []) {
      docs.push({ id: d.name.split('/').pop(), fields: decodeFields(d.fields || {}) });
    }
    pageToken = body.nextPageToken;
  } while (pageToken);
  return docs;
}

/** Create-or-replace a document at an explicit id. */
async function writeDoc(env, collectionPath, docId, data) {
  const paths = Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  await req(
    `${env.firestore}/documents/${collectionPath}/${docId}?${paths}`,
    {
      method: 'PATCH',
      headers: { ...env.headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: encodeFields(data) }),
    },
    `write ${collectionPath}/${docId}`,
  );
}

async function downloadBlob(env, objectPath) {
  const res = await req(env.storageDownload(objectPath), { headers: env.headers() }, `download ${objectPath}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadBlob(env, objectPath, buffer) {
  await req(
    env.storageUpload(objectPath),
    {
      method: 'POST',
      headers: {
        ...env.headers(),
        'Content-Type': 'image/png',
        ...(env.emulator ? {} : { 'Cache-Control': 'public, max-age=31536000, immutable' }),
      },
      body: buffer,
    },
    `upload ${objectPath}`,
  );
}

/**
 * Parse `--key value` / `--flag` argv into an object. A key given more than
 * once collects into an array — `--id a --id b` is the documented way to select
 * several documents, and last-wins would have exported only the last of them
 * while reporting success.
 */
function parseArgs(argv) {
  const out = {};
  const add = (key, value) => {
    if (key in out) out[key] = [].concat(out[key], value);
    else out[key] = value;
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) { add(key, next); i += 1; } else { add(key, true); }
  }
  return out;
}

/**
 * Read a flag that only makes sense once. Since parseArgs turns a repeat into
 * an array, a scalar reader would otherwise either pass the array straight
 * through (`--uid a --uid b` writing `uid: ['a','b']` into Firestore) or fail a
 * `typeof … === 'string'` test and silently act as though the flag were absent.
 * Both are worse than refusing.
 */
function singleArg(args, key) {
  const v = args[key];
  if (Array.isArray(v)) throw new Error(`--${key} was given ${v.length} times; it takes a single value`);
  return typeof v === 'string' ? v : undefined;
}

module.exports = {
  resolveEnv, listDocs, writeDoc, downloadBlob, uploadBlob, parseArgs, singleArg,
  decodeFields, encodeFields,
};

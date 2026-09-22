/**
 * Run every test there is: the unit tests, then the whole e2e suite in every browser with the
 * live AI tests switched on.
 *
 *   npm run test:all
 *   node scripts/test-all.mjs --skip-live          # everything but the real-model tests
 *   node scripts/test-all.mjs --project=chromium   # anything else goes to Playwright
 *
 * The live tests SPEND CREDITS against a real key. Like e2e-live.mjs, this exists because
 * `LIVE_AI=1 cmd` is bash only, and because what they need has to be running first:
 *
 *   editsvgcode       npm run dev    Vite on :3000 and the Firebase emulators
 *   editsvgcode-api   npm run dev    the API on :7071, built from the current source
 *
 * Playwright waits only for :3000 before it starts, so when it launches the dev server itself
 * the first sign-ins race the emulators and fail with auth/network-request-failed. Checking
 * the ports up front turns that, and a missing API, into one clear message before anything
 * runs, rather than a wall of failures twenty minutes in.
 */
import { spawnSync } from 'node:child_process';
import net from 'node:net';

const args = process.argv.slice(2);
const skipLive = args.includes('--skip-live');
const passthrough = args.filter((a) => a !== '--skip-live');

function listening(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    socket.setTimeout(1500);
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('timeout', () => { socket.destroy(); resolve(false); });
    socket.once('error', () => resolve(false));
  });
}

const needs = [
  { port: 9099, what: 'the Firebase auth emulator', start: 'npm run dev in editsvgcode' },
  { port: 8080, what: 'the Firestore emulator', start: 'npm run dev in editsvgcode' },
  ...(skipLive ? [] : [{ port: 7071, what: 'the API', start: 'npm run dev in editsvgcode-api (or pass --skip-live)' }]),
];
const missing = [];
for (const need of needs) {
  if (!(await listening(need.port))) missing.push(need);
}
if (missing.length > 0) {
  console.error('Not running yet:');
  for (const m of missing) console.error(`  :${m.port}  ${m.what} — start it with: ${m.start}`);
  process.exit(2);
}

// Each CLI run by node itself, not through npx and a shell: on Windows the shell re-read the
// arguments, so a --grep "a|b" became a pipe into a command called b.
const CLI = {
  vitest: 'node_modules/vitest/vitest.mjs',
  playwright: 'node_modules/@playwright/test/cli.js',
};

function run(title, command, commandArgs, env = process.env) {
  console.log(`\n=== ${title}\n`);
  const result = spawnSync(process.execPath, [CLI[command], ...commandArgs], { stdio: 'inherit', env });
  return result.status ?? 1;
}

const unit = run('unit tests', 'vitest', ['run']);
if (unit !== 0) {
  console.error('\nUnit tests failed; not starting the e2e suite.');
  process.exit(unit);
}

const env = { ...process.env };
if (skipLive) delete env.LIVE_AI;
else env.LIVE_AI = '1';
console.log(skipLive ? '\nLive AI tests: skipped' : '\nLive AI tests: ON — this spends credits');
process.exit(run('e2e, every browser', 'playwright', ['test', ...passthrough], env));

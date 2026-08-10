/**
 * Run the live AI e2e suite with a chosen model and reasoning effort.
 *
 * Exists because there is no cross-shell way to write `VAR=1 cmd`. That form is
 * bash only: PowerShell needs `$env:VAR='1';` as a separate statement and
 * cmd.exe needs `set`. Documenting one of the three in a comment means the
 * command is wrong for whoever is not using that shell, which is how the
 * documented invocation for this suite failed on the machine it was written on.
 *
 * CALL IT WITH NODE, NOT THROUGH NPM, whenever you are passing flags:
 *
 *   node scripts/e2e-live.mjs
 *   node scripts/e2e-live.mjs --model gpt-5.4 --effort low
 *   node scripts/e2e-live.mjs --model gpt-5.4 --effort high --list
 *
 * `npm run e2e:live -- --model gpt-5.4 --list` does NOT work: npm's own config
 * parser swallows `--flag value` pairs even after the `--`, so the script sees
 * two bare words and no flags. That is not a cosmetic difference — it silently
 * runs the suite at the app's DEFAULT model while reporting the settings you
 * asked for, and it ate a `--list` and ran for real. The guard below turns that
 * into an error rather than a wrong answer, but node is the invocation to use.
 *
 * Anything not consumed here is handed to Playwright untouched, so --list,
 * --headed, --repeat-each and friends work as usual.
 *
 * This SPENDS CREDITS against a real key and needs the API host on :7071.
 */
import { spawnSync } from 'node:child_process';

const passthrough = process.argv.slice(2);

/** Pull `--flag value` out of the argv we forward, or undefined. */
function take(flag) {
  const i = passthrough.indexOf(flag);
  if (i === -1) return undefined;
  const value = passthrough[i + 1];
  if (value === undefined || value.startsWith('--')) {
    console.error(`${flag} needs a value, e.g. ${flag} ${flag === '--model' ? 'gpt-5.4' : 'low'}`);
    process.exit(2);
  }
  passthrough.splice(i, 2);
  return value;
}

const model = take('--model');
const effort = take('--effort');

// npm ate the flags and left their values behind as bare words. Running anyway
// would use the app's default model and say so only in passing, which is a
// worse outcome than not running: the point of the knob is to know WHICH
// setting produced the result. Playwright reads stray positionals as test-name
// filters, so these would not even fail loudly on their own.
const strays = passthrough.filter((a) => !a.startsWith('-'));
if (strays.length > 0 && process.env.npm_lifecycle_event) {
  console.error(
    `Refusing to run: got bare arguments (${strays.join(', ')}) and no flags.\n` +
    'npm strips "--flag value" pairs even after "--", so the settings you asked for were lost.\n' +
    'Call the script directly instead:\n' +
    `  node scripts/e2e-live.mjs --model <name> --effort <level>`,
  );
  process.exit(2);
}

// Effort is stored per model on the client (esvg-effort-by-model), so there is
// nowhere to put it without knowing which model it belongs to. Silently
// dropping it would report a clean pass at a setting that never ran — the one
// outcome that makes the whole knob worthless.
if (effort && !model) {
  console.error('--effort needs --model too: the app stores effort per model, so it cannot be applied on its own.');
  process.exit(2);
}

const env = { ...process.env, LIVE_AI: '1' };
if (model) env.LIVE_AI_MODEL = model;
if (effort) env.LIVE_AI_EFFORT = effort;

console.log(`live e2e → model: ${model ?? '(app default)'}, effort: ${effort ?? '(app default)'}`);

const result = spawnSync(
  'npx',
  ['playwright', 'test', 'e2e/ai-tools-live.spec.ts', ...passthrough],
  // shell on Windows so `npx` resolves to npx.cmd; the arguments here never
  // contain spaces, so shell quoting has nothing to mangle.
  { stdio: 'inherit', env, shell: process.platform === 'win32' },
);

process.exit(result.status ?? 1);

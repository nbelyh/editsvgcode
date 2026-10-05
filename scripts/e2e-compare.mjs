/**
 * Run the comparison set (e2e/compare) against the real model and keep every result.
 *
 * For measuring a change to the AI: run once on one build, once on the other, then grade both
 * with scripts/compare-grade.mjs. Each run is saved under test-results/compare/<label>/.
 *
 * CALL IT WITH NODE, NOT THROUGH NPM — npm's config parser eats `--flag value` pairs (see
 * e2e-live.mjs, which has the same rule for the same reason):
 *
 *   node scripts/e2e-compare.mjs --label before --model qwen3.8-flash --effort medium --repeat 3
 *   node scripts/e2e-compare.mjs --label after --only hat,tail --repeat 4
 *
 *   --label   folder name for this pass (default "run"); a pass with the same label overwrites
 *   --model   the app's model id; left out, the app's default
 *   --effort  reasoning effort; needs --model, since the app stores effort per model
 *   --repeat  runs per case (default 3)
 *   --only    comma-separated case ids from e2e/compare/cases.json
 *   --workers parallel browsers (default 5)
 *
 * Anything else goes to Playwright untouched. This SPENDS CREDITS and needs the API host on
 * :7071 with the build under test.
 */
import { spawnSync } from 'node:child_process';

const passthrough = process.argv.slice(2);

/** Pull `--flag value` out of the argv we forward, or undefined. */
function take(flag) {
  const i = passthrough.indexOf(flag);
  if (i === -1) return undefined;
  const value = passthrough[i + 1];
  if (value === undefined || value.startsWith('--')) {
    console.error(`${flag} needs a value.`);
    process.exit(2);
  }
  passthrough.splice(i, 2);
  return value;
}

const label = take('--label') ?? 'run';
const model = take('--model');
const effort = take('--effort');
const repeat = take('--repeat') ?? '3';
const only = take('--only');
const workers = take('--workers') ?? '5';

if (effort && !model) {
  console.error('--effort needs --model too: the app stores effort per model, so it cannot be applied on its own.');
  process.exit(2);
}

const env = { ...process.env, COMPARE: '1', COMPARE_LABEL: label };
if (model) env.COMPARE_MODEL = model;
if (effort) env.COMPARE_EFFORT = effort;
if (only) env.COMPARE_ONLY = only;

console.log(`compare → label: ${label}, model: ${model ?? '(app default)'}, effort: ${effort ?? '(app default)'}, ${repeat} run(s) per case`);

const result = spawnSync(
  process.execPath,
  ['node_modules/@playwright/test/cli.js', 'test', 'e2e/compare/', '--project', 'chromium',
    '--repeat-each', repeat, '--workers', workers, '--reporter', 'list', ...passthrough],
  { stdio: 'inherit', env },
);

process.exit(result.status ?? 1);

/**
 * The build id for a shipped bundle, so the footer string and the source map
 * folder both point at one exact tree.
 *
 * The version comes from package.json and is bumped by hand; the short SHA pins
 * the tree the bundle was built from, which is what keeps two ships of the same
 * version apart.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('..', import.meta.url);

const git = (args) =>
  execFileSync('git', args, { cwd: fileURLToPath(root), encoding: 'utf8' }).trim();

/** @returns {string} e.g. `2.0.1+0b8f304`, or `2.0.1+0b8f304-dirty` */
export function getBuildVersion() {
  const version = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')).version;

  try {
    const sha = git(['rev-parse', '--short', 'HEAD']);
    const dirty = git(['status', '--porcelain']) ? '-dirty' : '';
    return `${version}+${sha}${dirty}`;
  } catch {
    return version; // built outside a checkout — no commit to name
  }
}

/** The same id as a path segment — `+` is awkward in URLs and blob tooling. */
export function getBuildTag() {
  return `v${getBuildVersion().replace('+', '-')}`;
}

/**
 * A turn's edit cards planned again without one of them, for rejecting a single card.
 *
 * Each card holds the drawing as it is after its own edit and every edit before it in the turn
 * (api-client planResponseEdits), so rejecting one could not simply drop it: the cards after it
 * still carried its change, and Reject threw the whole turn away instead. The calls were all
 * planned against one snapshot, so planned again against that same snapshot, without the
 * rejected one, every address in them still means what it meant.
 */

import { applyPlannedBatches, isStructuralEditTool, planEditCall, type PlannedEdit } from './svg-ai';

/** What the editor adds to a call's arguments; the rest is what the model sent. */
const ADDED = new Set(['svg', 'notExecuted', 'failedOperations', 'warnings', 'editNotes', 'documentBroken', 'fadedOut', 'pngDataUrl', 'vectorizerParams']);

/** Calls that are planned against the snapshot, and so can be planned again. */
export function isReplannable(name: string): boolean {
  return name === 'replace_lines' || isStructuralEditTool(name);
}

/**
 * The drawing after each of `calls`, in order, each including the ones before it — or null when
 * one of them cannot be planned again, and the cards should be left as they were.
 */
export function replan(snapshot: string, calls: Array<{ name: string; args: Record<string, unknown> }>): string[] | null {
  const batches: PlannedEdit[][] = [];
  for (const call of calls) {
    if (!isReplannable(call.name)) return null;
    const args = Object.fromEntries(Object.entries(call.args).filter(([k]) => !ADDED.has(k)));
    const plan = planEditCall(snapshot, call.name, args);
    if (plan.kind !== 'planned') return null;
    batches.push(plan.planned);
  }
  return applyPlannedBatches(snapshot, batches).svgAfter;
}

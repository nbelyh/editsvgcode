import {
  applyPlannedBatches, emptyCallHint, executeReadTool, planEditCall, summarizeEdits, validityRegression,
} from "../../src/lib/svg-ai";
import { validateSvg } from "../../src/lib/svg-dom";

/** Firestore refuses a document over 1 MiB (UTF-8 bytes); leave room for the other fields. */
export const MAX_SVG_BYTES = 900_000;

export function svgBytes(svg: string): number {
  return Buffer.byteLength(svg, "utf8");
}

export const READ_TOOLS = ["read_svg_lines", "search_svg", "query", "list_path_parts"] as const;
export const EDIT_TOOLS = [
  "replace_svg", "replace_lines", "set_text", "set_attribute", "set_style_rule",
  "insert_element", "remove_element", "split_path",
] as const;

export interface EditResult {
  /** The new document, or null when nothing should be written. */
  text: string | null;
  message: string;
}

/** Callers install the DOM first (dom.ts installDom). */
export function runReadTool(name: string, args: Record<string, unknown>, svg: string): string {
  return executeReadTool(name, args, svg) ?? `Unknown read tool "${name}".`;
}

/**
 * Apply one edit call to the document with the editor's own planner (svg-ai.ts planEditCall),
 * with one difference from the chat: there is no proposal card for a person to reject, so an
 * edit that would leave a well-formed document broken is NOT written.
 * Callers install the DOM first (dom.ts installDom).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyEditTool(name: string, args: any, current: string): EditResult {
  const snapshot = current.replace(/\r\n/g, "\n");
  const plan = planEditCall(snapshot, name, args);
  if (plan.kind === "refused") return { text: null, message: plan.reason };

  if (plan.kind === "replace") {
    // A missing or blank "svg" would wipe the drawing, and validityRegression lets that through
    // whenever the stored document is already malformed.
    if (!plan.svg.trim()) return { text: null, message: 'Not executed: "svg" must hold the complete new SVG markup.' };
    return finish(snapshot, plan.svg, "OK — replaced the whole document.");
  }

  const { outcomes, final } = applyPlannedBatches(snapshot, [plan.planned]);
  const summary = summarizeEdits(outcomes[0] ?? [], emptyCallHint(name));
  if (!(outcomes[0] ?? []).some((o) => o.status === "applied")) return { text: null, message: summary };
  return finish(snapshot, final, summary);
}

function finish(before: string, after: string, summary: string): EditResult {
  // An edit that does not grow the document is always allowed, so one saved from the editor
  // over the limit can still be cut down.
  const bytes = svgBytes(after);
  if (bytes > MAX_SVG_BYTES && bytes > svgBytes(before)) {
    return { text: null, message: `Not saved: the document would be ${bytes} bytes, over the ${MAX_SVG_BYTES}-byte limit.` };
  }
  const broke = validityRegression(before, after);
  if (broke) return { text: null, message: `Not saved: ${broke}` };
  const lines = after.split("\n").length;
  const note = validateSvg(after).valid ? "" : " The document is not well-formed XML yet, so only the line tools can address it.";
  return { text: after, message: `${summary}\nSaved. The document now has ${lines} lines.${note}` };
}

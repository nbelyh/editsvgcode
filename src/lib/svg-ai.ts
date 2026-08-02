/**
 * Client-side AI utilities: context budgeting, read-tool execution, edit application.
 * All SVG processing stays on the client — the server never receives the full SVG.
 */

const LINE_BUDGET = 1000;
const HEAD_LINES = 40;
const TAIL_LINES = 10;
const SELECTION_PADDING = 50;

/** Normalize \r\n to \n — Monaco on Windows uses \r\n, models always output \n */
function normalize(s: string): string {
  return s.replace(/\r\n/g, '\n');
}

/** Number each line: "1: <svg ...>" */
function numberLines(lines: string[], startIndex: number): string {
  return lines.map((line, i) => `${startIndex + i + 1}: ${line}`).join('\n');
}

/**
 * Build a token-budgeted SVG context string.
 * Small files are included in full. Large files get head + selection area + tail
 * with omission markers, and the model can use read_svg_lines / search_svg for the rest.
 */
export function buildSvgContext(
  currentSvg: string,
  selectedElement?: string,
  selectedLineRange?: { start: number; end: number }
): string {
  const svg = normalize(currentSvg);
  const lines = svg.split('\n');
  const totalLines = lines.length;
  const sizeKB = Math.round(svg.length / 1024);

  // Small file — include everything
  if (totalLines <= LINE_BUDGET) {
    const numbered = numberLines(lines, 0);
    const parts = [`SVG document (${totalLines} lines, ${sizeKB} KB):\n\`\`\`\n${numbered}\n\`\`\``];
    if (selectedElement && selectedLineRange) {
      parts.push(`\nSelected element (lines ${selectedLineRange.start}-${selectedLineRange.end}):\n\`\`\`svg\n${selectedElement}\n\`\`\``);
    } else if (selectedElement) {
      parts.push(`\nSelected element:\n\`\`\`svg\n${selectedElement}\n\`\`\``);
    }
    return parts.join('\n');
  }

  // Large file — budget: head + selection window + tail
  const headEnd = Math.min(HEAD_LINES, totalLines);
  const tailStart = Math.max(headEnd, totalLines - TAIL_LINES);

  // Determine selection window (if any)
  let selStart = -1;
  let selEnd = -1;
  if (selectedLineRange) {
    selStart = Math.max(0, selectedLineRange.start - 1 - SELECTION_PADDING);
    selEnd = Math.min(totalLines, selectedLineRange.end + SELECTION_PADDING);
    if (selStart <= headEnd) selStart = -1;
    if (selEnd >= tailStart) selEnd = -1;
  }

  const sections: string[] = [];
  sections.push(`SVG document (${totalLines} lines, ${sizeKB} KB — showing excerpts, use read_svg_lines/search_svg for full content):\n\`\`\``);

  // Head
  sections.push(numberLines(lines.slice(0, headEnd), 0));

  if (selStart >= 0 && selEnd >= 0 && selStart > headEnd) {
    const omitted1 = selStart - headEnd;
    sections.push(`[... lines ${headEnd + 1}-${selStart} omitted (${omitted1} lines) ...]`);
    sections.push(numberLines(lines.slice(selStart, selEnd), selStart));
    const omitted2 = tailStart - selEnd;
    if (omitted2 > 0) {
      sections.push(`[... lines ${selEnd + 1}-${tailStart} omitted (${omitted2} lines) ...]`);
    }
  } else {
    const omitted = tailStart - headEnd;
    if (omitted > 0) {
      sections.push(`[... lines ${headEnd + 1}-${tailStart} omitted (${omitted} lines) ...]`);
    }
  }

  // Tail
  if (tailStart < totalLines) {
    sections.push(numberLines(lines.slice(tailStart), tailStart));
  }

  sections.push('```');

  if (selectedElement && selectedLineRange) {
    sections.push(`\nSelected element (lines ${selectedLineRange.start}-${selectedLineRange.end}):\n\`\`\`svg\n${selectedElement}\n\`\`\``);
  } else if (selectedElement) {
    sections.push(`\nSelected element:\n\`\`\`svg\n${selectedElement}\n\`\`\``);
  }

  return sections.join('\n');
}

/**
 * Execute a read-only tool call (read_svg_lines or search_svg) against the SVG.
 * Returns the string result, or null if not a read-only tool.
 */
export function executeReadTool(
  toolName: string,
  args: Record<string, unknown>,
  currentSvg: string
): string | null {
  const lines = normalize(currentSvg).split('\n');

  if (toolName === 'read_svg_lines') {
    const start = Math.max(1, args.start as number);
    const end = Math.min(lines.length, args.end as number);
    if (start > lines.length) return `No content — SVG has only ${lines.length} lines.`;
    const slice = lines.slice(start - 1, end);
    return numberLines(slice, start - 1);
  }

  if (toolName === 'search_svg') {
    const query = (args.query as string).toLowerCase();
    const matches: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(query)) {
        matches.push(`${i + 1}: ${lines[i]}`);
        if (matches.length >= 100) {
          matches.push(`... (${lines.filter(l => l.toLowerCase().includes(query)).length} total matches, showing first 100)`);
          break;
        }
      }
    }
    return matches.length > 0 ? matches.join('\n') : `No matches found for "${args.query}".`;
  }

  return null;
}

/** One line-range replacement. `content` is the full new text for the range. */
export interface LineEdit {
  start: number;
  end: number;
  content: string;
}

/** What became of one requested edit, reported back to the model. */
export interface LineEditOutcome {
  label: string;
  status: 'applied' | 'failed' | 'conflict';
  detail?: string;
}

/**
 * Apply a batch of line-range replacements.
 *
 * Line numbers are the only way edits are addressed. Searching for text to
 * replace could never say *which* occurrence was meant without the model
 * knowing something about the whole document — a count, or a uniqueness
 * guarantee — and obtaining that costs a round trip per edit. A line number is
 * different: the model reads it straight off the numbered context or a search
 * result, so a hundred edits need no more lookups than one.
 *
 * Every range refers to the document as the model was shown it. Edits are
 * validated against that snapshot and then applied HIGHEST LINE FIRST, so an
 * edit that changes the line count cannot shift the target of any edit still to
 * come. Applying them in the given order against a document that each edit
 * mutates is what used to make a batch invalidate itself.
 *
 * Overlapping ranges are a contradiction in the request, not something to merge:
 * the first is applied and the rest are reported.
 */
export function applyLineEdits(
  currentSvg: string,
  edits: LineEdit[],
): { svg: string; outcomes: LineEditOutcome[] } {
  const lines = normalize(currentSvg).split('\n');
  const total = lines.length;
  const outcomes: LineEditOutcome[] = [];
  const accepted: LineEdit[] = [];

  for (const edit of edits) {
    const start = Number(edit.start);
    const end = Number(edit.end);
    const label = start === end ? `line ${start}` : `lines ${start}-${end}`;

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
      outcomes.push({ label, status: 'failed', detail: 'not a valid line range' });
      continue;
    }
    if (start > total) {
      outcomes.push({ label, status: 'failed', detail: `the document has only ${total} lines` });
      continue;
    }
    // Deleting a range is spelled with an explicit empty string. Treating a
    // MISSING content as "" would turn a malformed edit — one the model got cut
    // off writing, or an older client's shape — into a silent range deletion
    // reported as success. Destructive and invisible is the worst pair.
    if (typeof edit.content !== 'string') {
      outcomes.push({ label, status: 'failed', detail: 'no "content" given; use an empty string to delete the range' });
      continue;
    }
    const clash = accepted.find((a) => start <= a.end && a.start <= end);
    if (clash) {
      outcomes.push({
        label,
        status: 'conflict',
        detail: `overlaps the earlier edit to lines ${clash.start}-${clash.end}; this one was skipped`,
      });
      continue;
    }
    accepted.push({ start, end: Math.min(end, total), content: edit.content });
    outcomes.push({ label, status: 'applied' });
  }

  for (const e of [...accepted].sort((a, b) => b.start - a.start)) {
    const replacement = e.content === '' ? [] : normalize(e.content).split('\n');
    lines.splice(e.start - 1, e.end - e.start + 1, ...replacement);
  }

  return { svg: lines.join('\n'), outcomes };
}

/** A replacement of an exact span of the source. */
export interface SourceRange {
  start: number;
  end: number;
  replacement: string;
}

/**
 * Splice ranges in, highest offset first so none of them shift each other.
 *
 * Shared by every addressing mode — line numbers, element paths, selectors —
 * because they only differ in how a target is NAMED. Once resolved to a span of
 * the snapshot they are the same thing, which is what lets a response mix them
 * and still be checked for conflicts as one set.
 */
export function applyRanges(source: string, ranges: SourceRange[]): string {
  let out = source;
  for (const r of [...ranges].sort((a, b) => b.start - a.start)) {
    out = out.slice(0, r.start) + r.replacement + out.slice(r.end);
  }
  return out;
}

/** Ranges that overlap an earlier one, so a caller can report instead of
 * compounding them. Returns the indices of the losers, earliest wins. */
export function conflictingRanges(ranges: SourceRange[]): number[] {
  const losers: number[] = [];
  const kept: SourceRange[] = [];
  ranges.forEach((r, i) => {
    if (kept.some((k) => r.start < k.end && k.start < r.end)) losers.push(i);
    else kept.push(r);
  });
  return losers;
}

/**
 * The same line edits as `applyLineEdits`, expressed as source ranges so they
 * can be merged with structurally-addressed edits before anything is written.
 */
export function lineEditsToRanges(
  currentSvg: string,
  edits: LineEdit[],
): { ranges: SourceRange[]; outcomes: LineEditOutcome[] } {
  const source = normalize(currentSvg);
  const lines = source.split('\n');
  const starts: number[] = [];
  let at = 0;
  for (const line of lines) {
    starts.push(at);
    at += line.length + 1;
  }

  // Reuse the validation and conflict rules rather than restating them.
  const { outcomes } = applyLineEdits(source, edits);
  const ranges: SourceRange[] = [];
  edits.forEach((edit, i) => {
    if (outcomes[i]?.status !== 'applied') return;
    const start = Number(edit.start);
    const end = Math.min(Number(edit.end), lines.length);
    const from = starts[start - 1];
    const to = end < lines.length ? starts[end] : source.length;
    const replacement = edit.content === '' ? '' : normalize(edit.content) + (end < lines.length ? '\n' : '');
    ranges.push({ start: from, end: to, replacement });
  });
  return { ranges, outcomes };
}

/**
 * Apply several batches — one per replace_lines call in a single model response
 * — that all address the same snapshot.
 *
 * This is the cross-call half of the same defect. The model writes every call in
 * a response against the document it was SHOWN, not against the result of its
 * own earlier call, and it is explicitly told to split large jobs this way.
 * Feeding each call the previous call's output therefore shifted every line
 * number in the second call by however much the first one grew or shrank the
 * document — silently editing the wrong lines.
 *
 * `svgAfter[i]` is the document once batches 0..i have landed, which is what
 * each proposal needs to show.
 */
export function applyLineEditBatches(
  currentSvg: string,
  batches: LineEdit[][],
): { svgAfter: string[]; outcomes: LineEditOutcome[][]; final: string } {
  const snapshot = normalize(currentSvg);
  const flat: LineEdit[] = [];
  const ends: number[] = [];
  for (const batch of batches) {
    flat.push(...batch);
    ends.push(flat.length);
  }
  // One pass over the whole response decides every outcome, so a range in call 2
  // that collides with one in call 1 is reported as a conflict rather than
  // quietly compounding.
  const all = applyLineEdits(snapshot, flat);

  const svgAfter = ends.map((end) => applyLineEdits(snapshot, flat.slice(0, end)).svg);
  const outcomes = batches.map((_, i) => all.outcomes.slice(i === 0 ? 0 : ends[i - 1], ends[i]));
  return { svgAfter, outcomes, final: svgAfter[svgAfter.length - 1] ?? snapshot };
}

/**
 * The tool result the model sees. A bare count of failures left it re-issuing
 * the same broken edits, so each problem names its range and says what is wrong.
 */
export function summarizeLineEdits(outcomes: LineEditOutcome[]): string {
  // "applied 0 edit(s)" reads as success while nothing happened. The likely
  // cause is an "edits" array that never arrived — a call written against a
  // different schema than this client expects — and the model needs to be told
  // that, not congratulated.
  if (outcomes.length === 0) {
    return 'Nothing was changed: this call carried no edits. Each edit needs "start", "end" and "content" inside the "edits" array.';
  }
  const bad = outcomes.filter((o) => o.status !== 'applied');
  if (bad.length === 0) return `OK — applied ${outcomes.length} edit(s).`;
  return [
    `Applied ${outcomes.length - bad.length} of ${outcomes.length} edit(s); the rest changed nothing.`,
    ...bad.map((o) => `- ${o.status.toUpperCase()} ${o.label}: ${o.detail}`),
  ].join('\n');
}

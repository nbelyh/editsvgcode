import {
  validateSvg, resolveSelector, isSelectorError, describeMatches, describeNoMatch,
  planTextEdits, planAttributeEdits, planStyleRuleEdits, planElementInserts, planElementRemovals,
  type TextEdit, type AttributeEdit, type StyleRuleEdit, type TextEditOutcome,
  type ElementInsert, type ElementRemoval, type InsertPosition,
} from './svg-dom';

/**
 * Client-side AI utilities: context budgeting, read-tool execution, edit application.
 * All SVG processing stays on the client — the server never receives the full SVG.
 */

const LINE_BUDGET = 1000;
const HEAD_LINES = 40;
const TAIL_LINES = 10;
const SELECTION_PADDING = 50;

/**
 * Ceiling on the context body, and on any single line within it.
 *
 * A line budget alone does not bound anything: minified and raster-embedding
 * SVGs are a handful of enormous lines, so they slipped under LINE_BUDGET and
 * went to the server whole — which is how a 9-line, 718 KB document became a
 * "SVG too large" rejection instead of an excerpt. Chars are what the server
 * and the model actually count, so budget in chars too.
 */
const CHAR_BUDGET = 100_000;
const MAX_LINE_CHARS = 1200;

/** Normalize \r\n to \n — Monaco on Windows uses \r\n, models always output \n */
function normalize(s: string): string {
  return s.replace(/\r\n/g, '\n');
}

/**
 * Clip one over-long line, saying plainly how much was withheld.
 *
 * The marker matters as much as the clipping: a clipped line is NOT safe to
 * rewrite with replace_lines, because reproducing what is shown would discard
 * the rest of it — the same silent-data-loss failure the system prompt warns
 * about for line edits generally.
 */
function clipLine(line: string): string {
  if (line.length <= MAX_LINE_CHARS) return line;
  const withheld = line.length - MAX_LINE_CHARS;
  return `${line.slice(0, MAX_LINE_CHARS)} [... ${withheld} more chars on this line, not shown ...]`;
}

/**
 * Number each line: "1: <svg ...>".
 *
 * `clip` only on the excerpt path — a document already inside both budgets is
 * sent whole, and shortening its lines would cost replace_lines for no gain.
 */
function numberLines(lines: string[], startIndex: number, clip = false): string {
  return lines.map((line, i) => `${startIndex + i + 1}: ${clip ? clipLine(line) : line}`).join('\n');
}

/**
 * Cut text down to `limit`, never mid-line.
 *
 * Dropping a whole line is recoverable — the model can see the numbering jump
 * and read the rest with read_svg_lines. Cutting one in half is not: the line
 * still looks complete and rewriting it would discard the remainder, which is
 * the same silent-data-loss failure clipLine guards against.
 */
function truncateAtLine(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const note = '[... context truncated here — later lines are not shown; use read_svg_lines/search_svg for the rest ...]';
  const cut = text.lastIndexOf('\n', limit);
  // Every line on this path is already clipped to MAX_LINE_CHARS, so a boundary
  // exists well inside any sane limit; keeping nothing beats keeping half a line.
  return cut < 0 ? note : `${text.slice(0, cut)}\n${note}`;
}

/** The warning that rides along whenever any shown line was clipped. */
const CLIPPED_NOTE =
  ' Some lines are too long to show in full and are marked "more chars on this line, not shown" —'
  + ' those lines are incomplete, so do NOT rewrite them with replace_lines; address them with'
  + ' find_replace or search_svg instead.';

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
  const clipped = lines.some((l) => l.length > MAX_LINE_CHARS);

  // Small file — include everything
  if (totalLines <= LINE_BUDGET && svg.length <= CHAR_BUDGET) {
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
  sections.push(`SVG document (${totalLines} lines, ${sizeKB} KB — showing excerpts, use read_svg_lines/search_svg for full content).${clipped ? CLIPPED_NOTE : ''}\n\`\`\``);

  // Head
  sections.push(numberLines(lines.slice(0, headEnd), 0, true));

  if (selStart >= 0 && selEnd >= 0 && selStart > headEnd) {
    const omitted1 = selStart - headEnd;
    sections.push(`[... lines ${headEnd + 1}-${selStart} omitted (${omitted1} lines) ...]`);
    sections.push(numberLines(lines.slice(selStart, selEnd), selStart, true));
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
    sections.push(numberLines(lines.slice(tailStart), tailStart, true));
  }

  // The selection is quoted from the same oversized document, so it gets the
  // same treatment — one selected <path> can carry the whole file's geometry.
  const selection = selectedElement
    ? selectedElement.split('\n').map(clipLine).join('\n')
    : undefined;
  const selectionBlock = !selection ? ''
    : selectedLineRange
      ? `\n\nSelected element (lines ${selectedLineRange.start}-${selectedLineRange.end}):\n\`\`\`svg\n${truncateAtLine(selection, CHAR_BUDGET / 2)}\n\`\`\``
      : `\n\nSelected element:\n\`\`\`svg\n${truncateAtLine(selection, CHAR_BUDGET / 2)}\n\`\`\``;

  // Backstop. Head, tail and a padded selection window are each bounded, but
  // their sum is not, so the excerpt gets one last cut — taken BEFORE the fence
  // is closed and always on a line boundary, so an overflow can never leave a
  // numbered line half-written or a code block unterminated. The selection is
  // budgeted out first: it is the part the user is actually pointing at.
  const room = CHAR_BUDGET - selectionBlock.length;
  return `${truncateAtLine(sections.join('\n'), room)}\n\`\`\`${selectionBlock}`;
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

  if (toolName === 'query') {
    const selector = String(args.query ?? args.selector ?? '');
    const limit = typeof args.limit === 'number' && args.limit > 0 ? args.limit : 200;
    const validity = validateSvg(currentSvg);
    if (!validity.doc) {
      // Routine while the user is mid-keystroke. Say which tools still work
      // rather than leaving the model to discover it by failing.
      return `The document is not valid XML right now (${validity.message}), so elements cannot be addressed. Use search_svg and read_svg_lines to look around, and replace_lines to edit, until it parses.`;
    }
    const found = resolveSelector(validity.doc, selector);
    if (isSelectorError(found)) return `Error: ${found.error}`;
    if (found.length === 0) {
      return `Nothing matched "${selector}": ${describeNoMatch(validity.doc, selector)}`;
    }
    const shown = describeMatches(currentSvg, validity.doc, found.slice(0, limit));
    const rows = shown.flatMap((m) => {
      // One address per row, and the short one when there is one. Listing both
      // invites copying the long one; listing only the long one is what produced
      // ".../g[402]/g[6]/text[1]" from ".../g[402]/g[1]/g[6]/text[1]" — the right
      // index with a repeated step dropped, refused, and the label left in
      // English. An id-anchored address has nothing in it to lose.
      const bits = [m.address ?? m.path, `<${m.tag}>`];
      if (m.id) bits.push(`id=${JSON.stringify(m.id)}`);
      if (m.className) bits.push(`class=${JSON.stringify(m.className)}`);
      if (m.line !== undefined) bits.push(`line ${m.line}`);
      if (m.text !== undefined) bits.push(`text=${JSON.stringify(m.text)}`);
      const row = '  ' + bits.join('  ');
      // A container answered with its own path alone is a dead end: set_text
      // refuses a group, and the model has nowhere else to go. Hand back the
      // addresses that hold the text so the next call can be the right one.
      const extra: string[] = [];
      if (m.textIn?.length) {
        extra.push(`    text inside: ${m.textIn.map((t) => `${t.path} ${JSON.stringify(t.text)}`).join(', ')}`);
      }
      if (m.blockLines) {
        // What the label reads, line by line, and the one call that rewrites it.
        // Addressing this element with a single line is what the model reached
        // for and kept being refused for; now the address is right and only the
        // shape of the text was missing.
        extra.push(`    ${m.blockLines.length}-line label: ${m.blockLines.map((t) => JSON.stringify(t)).join(' / ')}. set_text this path with all ${m.blockLines.length} lines separated by newlines to rewrite it.`);
      }
      return extra.length ? [row, ...extra] : [row];
    });
    const header = found.length > shown.length
      ? `${found.length} element(s) matched "${selector}"; showing the first ${shown.length}.`
      : `${found.length} element(s) matched "${selector}".`;
    return [header, ...rows].join('\n');
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

/** A replacement of an exact span of the source. */
export interface SourceRange {
  start: number;
  end: number;
  replacement: string;
  /** Identity for zero-width spans — see `TextEditRange.key`. */
  key?: string;
  /**
   * This span deletes through to the end of the document. The newline that
   * used to terminate the line before it is then left dangling, so the caller
   * trims it once at the end rather than reaching backwards here — reaching
   * back made the span collide with the edit above it and get dropped.
   */
  toEndOfDocument?: boolean;
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
  // Ties broken by LATER index first. Splicing right-to-left means each write
  // pushes earlier writes rightwards, so two insertions at one offset come out
  // reversed unless the last one goes in first. Two icons inserted after the
  // same anchor were being painted in the opposite order to the one asked for,
  // which in SVG is the difference between on top and underneath.
  const ordered = ranges
    .map((r, i) => ({ r, i }))
    .sort((a, b) => (b.r.start - a.r.start) || (b.i - a.i));
  for (const { r } of ordered) {
    out = out.slice(0, r.start) + r.replacement + out.slice(r.end);
  }
  return out;
}

/**
 * One requested operation, resolved to spans of the snapshot but not yet applied.
 *
 * This is where the addressing modes meet. A line range, an element path and a
 * CSS selector are three ways of NAMING a target; once each is turned into the
 * bytes it covers they are the same kind of thing, so one response can mix them
 * and still be checked for contradictions as a single set. An operation that
 * could not be resolved at all arrives here already failed, carrying the reason
 * the model needs to hear.
 */
export interface PlannedEdit {
  /** How this operation is named back to the model, e.g. `lines 4-9`. */
  label: string;
  status: 'applied' | 'failed';
  detail?: string;
  /** Every span this one operation touches — a selector may reach many. */
  ranges: SourceRange[];
}

/** Whether two spans contend for the same bytes, counting an insertion point
 * that falls inside another span. */
function rangesOverlap(a: SourceRange, b: SourceRange): boolean {
  const aEmpty = a.start === a.end;
  const bEmpty = b.start === b.end;
  // Two insertions occupy no bytes, so byte overlap can never separate them.
  // Setting two DIFFERENT absent attributes on one element puts both at the
  // same offset and both belong; setting the SAME one twice is a
  // contradiction, and applying both wrote a duplicate attribute that made the
  // document stop being well-formed while reporting success.
  if (aEmpty && bEmpty) return a.start === b.start && a.key !== undefined && a.key === b.key;
  if (a.start < b.end && b.start < a.end) return true;
  if (aEmpty) return a.start > b.start && a.start < b.end;
  if (bEmpty) return b.start > a.start && b.start < a.end;
  return false;
}

/**
 * Resolve line edits to spans, validating each one on its own.
 *
 * Line numbers are how a line edit names its target, and the reason that works
 * is cheapness: searching for text to replace could never say WHICH occurrence
 * was meant without the model knowing something about the whole document — a
 * count, or a uniqueness guarantee — and obtaining that costs a round trip per
 * edit. A line number is read straight off the numbered context or a search
 * result, so a hundred edits need no more lookups than one.
 *
 * Every range refers to the document as the model was SHOWN it, never to the
 * result of its own earlier edits; applying them in the given order against a
 * document that each one mutates is what used to make a batch invalidate
 * itself.
 *
 * Contradictions between edits are deliberately NOT decided here: they are
 * settled by `applyPlannedBatches` over the whole response, so a line edit
 * colliding with a structural one is caught by the same rule as two line edits
 * colliding.
 */
export function lineEditsToPlanned(currentSvg: string, edits: LineEdit[]): PlannedEdit[] {
  const source = normalize(currentSvg);
  const lines = source.split('\n');
  const total = lines.length;
  const starts: number[] = [];
  let at = 0;
  for (const line of lines) {
    starts.push(at);
    at += line.length + 1;
  }

  return edits.map((edit): PlannedEdit => {
    const start = Number(edit.start);
    const end = Number(edit.end);
    const label = start === end ? `line ${start}` : `lines ${start}-${end}`;

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
      return { label, status: 'failed', detail: 'not a valid line range', ranges: [] };
    }
    if (start > total) {
      return { label, status: 'failed', detail: `the document has only ${total} lines`, ranges: [] };
    }
    // Deleting a range is spelled with an explicit empty string. Treating a
    // MISSING content as "" would turn a malformed edit — one the model got cut
    // off writing, or an older client's shape — into a silent range deletion
    // reported as success. Destructive and invisible is the worst pair.
    if (typeof edit.content !== 'string') {
      return { label, status: 'failed', detail: 'no "content" given; use an empty string to delete the range', ranges: [] };
    }

    const last = Math.min(end, total);
    const deleting = edit.content === '';
    const from = starts[start - 1];
    const to = last < total ? starts[last] : source.length;
    const replacement = deleting ? '' : normalize(edit.content) + (last < total ? '\n' : '');
    // A deletion running to the end of the file leaves the newline that
    // terminated the line above it, so the file would end in a blank line.
    // Widening this span backwards to eat that byte was the obvious fix and the
    // wrong one: the byte belongs to the line above, so the span collided with
    // any edit to it and one of the two was silently dropped as a conflict.
    // The trim happens once, on the finished document, where nothing contends
    // for it.
    const toEndOfDocument = deleting && last === total && start > 1;
    return { label, status: 'applied', ranges: [{ start: from, end: to, replacement, toEndOfDocument }] };
  });
}

/**
 * Apply several batches — one per edit call in a single model response — that
 * all address the same snapshot.
 *
 * This is the cross-call half of the drift defect. The model writes every call
 * in a response against the document it was SHOWN, not against the result of its
 * own earlier call, and it is explicitly told to split large jobs this way.
 * Feeding each call the previous call's output therefore shifted every line
 * number in the second call by however much the first one grew or shrank the
 * document — silently editing the wrong lines.
 *
 * `svgAfter[i]` is the document once batches 0..i have landed, which is what
 * each proposal needs to show.
 */
export function applyPlannedBatches(
  currentSvg: string,
  batches: PlannedEdit[][],
): { svgAfter: string[]; outcomes: LineEditOutcome[][]; final: string } {
  const source = normalize(currentSvg);
  // Earliest wins, across the whole response rather than within one call.
  const kept: Array<{ range: SourceRange; label: string }> = [];
  const perBatch: SourceRange[][] = [];
  const outcomes: LineEditOutcome[][] = [];

  for (const batch of batches) {
    const mine: SourceRange[] = [];
    const batchOutcomes: LineEditOutcome[] = [];

    for (const edit of batch) {
      if (edit.status !== 'applied' || edit.ranges.length === 0) {
        batchOutcomes.push({ label: edit.label, status: edit.status, detail: edit.detail });
        continue;
      }

      let clash: string | undefined;
      const free = edit.ranges.filter((r) => {
        const hit = kept.find((k) => rangesOverlap(r, k.range));
        if (hit && !clash) clash = hit.label;
        return !hit;
      });

      if (free.length === 0) {
        batchOutcomes.push({
          label: edit.label,
          status: 'conflict',
          // Naming the same address on both sides of "overlaps" reads as a bug
          // in the tool rather than a contradiction in the request, and the
          // model needs to know it asked for the same thing twice.
          detail: clash === edit.label
            ? 'this target was already changed earlier in this response; the first change was kept and this one was skipped. Address each element once.'
            : `overlaps the earlier edit to ${clash}; this one was skipped`,
        });
        continue;
      }

      for (const r of free) kept.push({ range: r, label: edit.label });
      mine.push(...free);
      const lost = edit.ranges.length - free.length;
      const note = lost > 0
        ? clash === edit.label
          ? `${lost} of ${edit.ranges.length} target(s) were already changed earlier in this response and were skipped`
          : `${lost} of ${edit.ranges.length} target(s) overlapped the earlier edit to ${clash} and were skipped`
        : undefined;
      batchOutcomes.push({
        label: edit.label,
        status: 'applied',
        detail: [note, edit.detail].filter(Boolean).join('; ') || undefined,
      });
    }

    perBatch.push(mine);
    outcomes.push(batchOutcomes);
  }

  const svgAfter: string[] = [];
  const running: SourceRange[] = [];
  for (const mine of perBatch) {
    running.push(...mine);
    const out = applyRanges(source, running);
    // See `SourceRange.toEndOfDocument`: the dangling newline is removed here,
    // after everything has landed, so no edit has to contend for that byte.
    svgAfter.push(running.some((r) => r.toEndOfDocument) && out.endsWith('\n') ? out.slice(0, -1) : out);
  }
  return { svgAfter, outcomes, final: svgAfter[svgAfter.length - 1] ?? source };
}

/** Structural edit tools, and how their arguments are shaped. */
export const STRUCTURAL_EDIT_TOOLS = [
  'set_text', 'set_attribute', 'set_style_rule', 'insert_element', 'remove_element',
] as const;

/** Is this a tool whose targets are named structurally rather than by line? */
export function isStructuralEditTool(name: string): boolean {
  return (STRUCTURAL_EDIT_TOOLS as readonly string[]).includes(name);
}

/**
 * Resolve a structural edit call against the snapshot, in the same currency as
 * line edits.
 *
 * `available: false` is the deliberate answer while the document does not parse:
 * a half-typed SVG is an ordinary state in an editor, and the honest response is
 * to say so and point at line editing rather than to guess at a broken tree.
 */
export function planStructuralEdits(
  snapshot: string,
  toolName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any,
): { planned: PlannedEdit[]; available: boolean; reason?: string } {
  const source = normalize(snapshot);
  const raw = Array.isArray(args?.edits) ? args.edits : [];

  if (toolName === 'set_text') {
    const edits: TextEdit[] = raw.map((e: Record<string, unknown>) => ({
      selector: String(e?.selector ?? ''),
      text: typeof e?.text === 'string' ? e.text : '',
    }));
    // Every edit is checked, not just the first bad one. A missing "text" would
    // otherwise blank the element and be reported as a success — the same
    // silent-destruction shape a missing "content" has.
    const missingText = raw.map((e: Record<string, unknown>) => typeof e?.text !== 'string');
    const result = planTextEdits(source, edits);
    if (!result.available) return { planned: [], available: false, reason: result.reason };
    const planned = result.outcomes.map((o, i): PlannedEdit => ({
      label: `text of ${JSON.stringify(o.selector)}`,
      status: missingText[i] ? 'failed' : o.status,
      detail: missingText[i] ? 'no "text" given; use an empty string to clear the element' : o.detail,
      ranges: missingText[i] ? [] : o.ranges,
    }));
    return { planned, available: true };
  }

  if (toolName === 'set_attribute') {
    const edits: AttributeEdit[] = raw.map((e: Record<string, unknown>) => ({
      selector: String(e?.selector ?? ''),
      name: String(e?.name ?? ''),
      // An explicit null removes the attribute; anything else is a value.
      value: e?.value === null ? null : String(e?.value ?? ''),
    }));
    const result = planAttributeEdits(source, edits);
    if (!result.available) return { planned: [], available: false, reason: result.reason };
    const planned = result.outcomes.map((o, i): PlannedEdit => ({
      label: `${edits[i]?.name || 'attribute'} on ${JSON.stringify(o.selector)}`,
      status: o.status,
      detail: o.detail,
      ranges: o.ranges,
    }));
    return { planned, available: true };
  }

  if (toolName === 'set_style_rule') {
    const edits: StyleRuleEdit[] = raw.map((e: Record<string, unknown>) => ({
      selector: String(e?.selector ?? ''),
      property: String(e?.property ?? ''),
      value: e?.value === null ? null : String(e?.value ?? ''),
    }));
    const result = planStyleRuleEdits(source, edits);
    if (!result.available) return { planned: [], available: false, reason: result.reason };
    return { planned: result.outcomes.map(toPlanned), available: true };
  }

  if (toolName === 'insert_element') {
    const positions: InsertPosition[] = ['before', 'after', 'first-child', 'last-child'];
    const edits: ElementInsert[] = raw.map((e: Record<string, unknown>) => ({
      selector: String(e?.selector ?? ''),
      position: positions.includes(e?.position as InsertPosition) ? (e.position as InsertPosition) : 'after',
      svg: typeof e?.svg === 'string' ? e.svg : '',
    }));
    // A position we do not recognise silently became "after", which puts the
    // element somewhere the model did not ask for and reports success.
    const badPosition = raw.map((e: Record<string, unknown>) =>
      e?.position !== undefined && !positions.includes(e.position as InsertPosition));
    const result = planElementInserts(source, edits);
    if (!result.available) return { planned: [], available: false, reason: result.reason };
    const planned = result.outcomes.map((o, i): PlannedEdit => badPosition[i]
      ? {
          label: `insert into ${JSON.stringify(edits[i].selector)}`,
          status: 'failed',
          detail: `"${String(raw[i]?.position)}" is not a position; use before, after, first-child or last-child`,
          ranges: [],
        }
      : toPlanned(o));
    return { planned, available: true };
  }

  if (toolName === 'remove_element') {
    const edits: ElementRemoval[] = raw.map((e: Record<string, unknown>) => ({ selector: String(e?.selector ?? '') }));
    const result = planElementRemovals(source, edits);
    if (!result.available) return { planned: [], available: false, reason: result.reason };
    return { planned: result.outcomes.map(toPlanned), available: true };
  }

  return { planned: [], available: false, reason: `unknown structural tool "${toolName}"` };
}

/** These planners already label their own outcomes, so the label passes through. */
function toPlanned(o: TextEditOutcome): PlannedEdit {
  return { label: o.selector, status: o.status, detail: o.detail, ranges: o.ranges };
}

/**
 * Did this change break a document that parsed a moment ago?
 *
 * The structural tools are guarded on the way IN — they refuse to address a
 * document that does not parse. Nothing was checking the way OUT, and that is
 * the direction the damage actually travels: every failure this session took
 * the same shape, an edit reporting success over a document that was worse than
 * before. Each tool is individually safe, but replace_lines re-emits whole lines
 * and replace_svg rewrites everything, so a response can still end somewhere
 * neither the model nor the user asked to be.
 *
 * `null` when the document was ALREADY broken: the user is mid-keystroke, that
 * is an ordinary state, and blaming the edit for it would cry wolf on every
 * turn until they finish typing.
 */
export function validityRegression(before: string, after: string): string | null {
  if (!validateSvg(before).valid) return null;
  const now = validateSvg(after);
  if (now.valid) return null;
  return `the document parsed before this change and does not parse after it (${now.message}). Something in this call did not reproduce the markup it replaced. Re-read the affected lines and fix it — do not re-issue the same call.`;
}

/**
 * The tool result the model sees. A bare count of failures left it re-issuing
 * the same broken edits, so each problem names its target and says what is wrong.
 */
export function summarizeEdits(outcomes: LineEditOutcome[], emptyHint: string): string {
  // "applied 0 edit(s)" reads as success while nothing happened. The likely
  // cause is an "edits" array that never arrived — a call written against a
  // different schema than this client expects — and the model needs to be told
  // that, not congratulated.
  if (outcomes.length === 0) return `Nothing was changed: this call carried no edits. ${emptyHint}`;
  const bad = outcomes.filter((o) => o.status !== 'applied');
  // An edit can succeed and still not do what was asked — setting a presentation
  // attribute that a <style> rule overrides changes the markup and nothing on
  // screen. Reporting only failures dropped that note entirely, so the model
  // said "done" about an edit with no visible effect. Notes on APPLIED edits are
  // the whole reason the check exists.
  const notes = outcomes.filter((o) => o.status === 'applied' && o.detail);
  const lines: string[] = [];
  lines.push(bad.length === 0
    ? `OK — applied ${outcomes.length} edit(s).`
    : `Applied ${outcomes.length - bad.length} of ${outcomes.length} edit(s); the rest changed nothing.`);
  for (const o of bad) lines.push(`- ${o.status.toUpperCase()} ${o.label}: ${o.detail}`);
  for (const o of notes) lines.push(`- NOTE ${o.label}: ${o.detail}`);
  return lines.join('\n');
}

export function summarizeLineEdits(outcomes: LineEditOutcome[]): string {
  return summarizeEdits(outcomes, 'Each edit needs "start", "end" and "content" inside the "edits" array.');
}

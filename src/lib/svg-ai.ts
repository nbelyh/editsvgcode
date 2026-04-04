/**
 * Client-side AI utilities: context budgeting, read-tool execution, edit application.
 * All SVG processing stays on the client — the server never receives the full SVG.
 */

const LINE_BUDGET = 300;
const HEAD_LINES = 20;
const TAIL_LINES = 5;
const SELECTION_PADDING = 30;

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

/**
 * Apply edit_svg operations to the SVG, returning the result and any failed operations.
 */
export function applyEditSvg(
  currentSvg: string,
  operations: Array<{ find: string; replace: string; replaceAll?: boolean }>
): { svg: string; failed: string[] } {
  let svg = normalize(currentSvg);
  const failed: string[] = [];
  for (const op of operations) {
    const find = normalize(op.find);
    const replace = normalize(op.replace);
    if (svg.includes(find)) {
      svg = op.replaceAll ? svg.split(find).join(replace) : svg.replace(find, replace);
    } else {
      failed.push(find.length > 60 ? find.substring(0, 60) + '…' : find);
    }
  }
  return { svg, failed };
}

/**
 * Apply replace_lines: replace lines [start..end] (1-based, inclusive) with new content.
 */
export function applyReplaceLines(
  currentSvg: string,
  start: number,
  end: number,
  content: string
): string {
  const svg = normalize(currentSvg);
  const lines = svg.split('\n');
  const before = lines.slice(0, start - 1);
  const after = lines.slice(end);
  const newContent = content ? content.split('\n') : [];
  return [...before, ...newContent, ...after].join('\n');
}

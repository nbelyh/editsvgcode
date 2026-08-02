import { describe, it, expect } from 'vitest';
import {
  applyLineEdits, applyLineEditBatches, summarizeLineEdits,
  lineEditsToRanges, applyRanges, conflictingRanges, type LineEdit,
} from '../svg-ai';

const doc = 'a\nb\nc\nd\ne';

describe('applyLineEdits — a batch must not invalidate itself', () => {
  it('keeps later line numbers valid when an earlier edit grows the document', () => {
    const { svg } = applyLineEdits(doc, [
      { start: 2, end: 2, content: 'B1\nB2\nB3' }, // +2 lines
      { start: 4, end: 4, content: 'D' },          // still the original line 4
    ]);
    expect(svg).toBe('a\nB1\nB2\nB3\nc\nD\ne');
  });

  it('keeps later line numbers valid when an earlier edit shrinks the document', () => {
    const { svg } = applyLineEdits(doc, [
      { start: 2, end: 3, content: 'BC' }, // -1 line
      { start: 5, end: 5, content: 'E' },  // still the original line 5
    ]);
    expect(svg).toBe('a\nBC\nd\nE');
  });

  it('is order-independent — edits given bottom-up give the same result', () => {
    const top = applyLineEdits(doc, [
      { start: 2, end: 2, content: 'B1\nB2' },
      { start: 4, end: 4, content: 'D' },
    ]);
    const bottom = applyLineEdits(doc, [
      { start: 4, end: 4, content: 'D' },
      { start: 2, end: 2, content: 'B1\nB2' },
    ]);
    expect(top.svg).toBe(bottom.svg);
  });

  it('applies many edits across the document', () => {
    const { svg, outcomes } = applyLineEdits(doc, [
      { start: 1, end: 1, content: 'A' },
      { start: 3, end: 3, content: 'C' },
      { start: 5, end: 5, content: 'E' },
    ]);
    expect(svg).toBe('A\nb\nC\nd\nE');
    expect(outcomes.every((o) => o.status === 'applied')).toBe(true);
  });
});

describe('applyLineEdits — replace, insert, delete', () => {
  it('replaces a range with fewer lines', () => {
    expect(applyLineEdits(doc, [{ start: 2, end: 4, content: 'X' }]).svg).toBe('a\nX\ne');
  });

  it('deletes a range with empty content', () => {
    expect(applyLineEdits(doc, [{ start: 2, end: 3, content: '' }]).svg).toBe('a\nd\ne');
  });

  it('inserts by expanding a line into several', () => {
    expect(applyLineEdits('a\nc', [{ start: 1, end: 1, content: 'a\nb' }]).svg).toBe('a\nb\nc');
  });

  it('replaces the last line', () => {
    expect(applyLineEdits(doc, [{ start: 5, end: 5, content: 'E' }]).svg).toBe('a\nb\nc\nd\nE');
  });

  it('normalizes CRLF in both the document and the replacement', () => {
    expect(applyLineEdits('a\r\nb', [{ start: 2, end: 2, content: 'B1\r\nB2' }]).svg).toBe('a\nB1\nB2');
  });
});

describe('applyLineEdits — refusals', () => {
  it('reports a range past the end of the document', () => {
    const { svg, outcomes } = applyLineEdits(doc, [{ start: 9, end: 9, content: 'x' }]);
    expect(svg).toBe(doc);
    expect(outcomes[0]).toMatchObject({ status: 'failed', label: 'line 9' });
    expect(outcomes[0].detail).toMatch(/only 5 lines/);
  });

  it('clamps an end that runs past the document rather than failing', () => {
    expect(applyLineEdits(doc, [{ start: 4, end: 99, content: 'D' }]).svg).toBe('a\nb\nc\nD');
  });

  it('rejects an inverted range', () => {
    const { outcomes } = applyLineEdits(doc, [{ start: 4, end: 2, content: 'x' }]);
    expect(outcomes[0].detail).toMatch(/not a valid line range/);
  });

  it('skips an overlapping edit and says which one it clashed with', () => {
    const { svg, outcomes } = applyLineEdits(doc, [
      { start: 2, end: 3, content: 'BC' },
      { start: 3, end: 4, content: 'CD' },
    ]);
    expect(svg).toBe('a\nBC\nd\ne');
    expect(outcomes[1]).toMatchObject({ status: 'conflict' });
    expect(outcomes[1].detail).toMatch(/overlaps the earlier edit to lines 2-3/);
  });

  it('applies the good edits in a batch and reports only the bad ones', () => {
    const { svg, outcomes } = applyLineEdits(doc, [
      { start: 1, end: 1, content: 'A' },
      { start: 99, end: 99, content: 'nope' },
      { start: 5, end: 5, content: 'E' },
    ]);
    expect(svg).toBe('A\nb\nc\nd\nE');
    expect(outcomes.map((o) => o.status)).toEqual(['applied', 'failed', 'applied']);
  });
});

describe('applyLineEdits — a missing content is not a deletion', () => {
  it('refuses an edit with no content rather than deleting the range', () => {
    // '' means delete; absent must not. Silently removing lines and reporting
    // success is the worst failure this tool could have.
    const { svg, outcomes } = applyLineEdits(doc, [{ start: 2, end: 3 } as never]);
    expect(svg).toBe(doc);
    expect(outcomes[0]).toMatchObject({ status: 'failed' });
    expect(outcomes[0].detail).toMatch(/no "content" given/);
  });

  it('still deletes on an explicit empty string', () => {
    expect(applyLineEdits(doc, [{ start: 2, end: 3, content: '' }]).svg).toBe('a\nd\ne');
  });

  it('refuses a non-string content', () => {
    const { outcomes } = applyLineEdits(doc, [{ start: 1, end: 1, content: 42 } as never]);
    expect(outcomes[0].status).toBe('failed');
  });
});

describe('applyLineEditBatches — several calls in one response', () => {
  it('resolves each call against the snapshot, not against the previous call', () => {
    // The cross-call drift: call 1 grows the document by two lines, so call 2's
    // line 4 would land on the wrong line if it saw call 1's output.
    const { final } = applyLineEditBatches(doc, [
      [{ start: 2, end: 2, content: 'B1\nB2\nB3' }],
      [{ start: 4, end: 4, content: 'D' }],
    ]);
    expect(final).toBe('a\nB1\nB2\nB3\nc\nD\ne');
  });

  it('matches what one combined batch would produce', () => {
    const batched = applyLineEditBatches(doc, [
      [{ start: 2, end: 2, content: 'B1\nB2' }],
      [{ start: 5, end: 5, content: 'E' }],
    ]).final;
    const single = applyLineEdits(doc, [
      { start: 2, end: 2, content: 'B1\nB2' },
      { start: 5, end: 5, content: 'E' },
    ]).svg;
    expect(batched).toBe(single);
  });

  it('gives each call the document as it stands after its own edits', () => {
    const { svgAfter } = applyLineEditBatches(doc, [
      [{ start: 1, end: 1, content: 'A' }],
      [{ start: 5, end: 5, content: 'E' }],
    ]);
    expect(svgAfter[0]).toBe('A\nb\nc\nd\ne');
    expect(svgAfter[1]).toBe('A\nb\nc\nd\nE');
  });

  it('attributes outcomes back to the call that produced them', () => {
    const { outcomes } = applyLineEditBatches(doc, [
      [{ start: 1, end: 1, content: 'A' }],
      [{ start: 99, end: 99, content: 'x' }],
    ]);
    expect(outcomes[0][0].status).toBe('applied');
    expect(outcomes[1][0].status).toBe('failed');
  });

  it('reports a conflict between ranges in two different calls', () => {
    const { outcomes, final } = applyLineEditBatches(doc, [
      [{ start: 2, end: 3, content: 'BC' }],
      [{ start: 3, end: 4, content: 'CD' }],
    ]);
    expect(final).toBe('a\nBC\nd\ne');
    expect(outcomes[1][0].status).toBe('conflict');
  });

  it('handles a response with no edit calls', () => {
    expect(applyLineEditBatches(doc, []).final).toBe(doc);
  });
});

describe('summarizeLineEdits', () => {
  it('stays short when everything worked', () => {
    const { outcomes } = applyLineEdits(doc, [{ start: 1, end: 1, content: 'A' }]);
    expect(summarizeLineEdits(outcomes)).toBe('OK — applied 1 edit(s).');
  });

  it('does not report success when the call carried no edits at all', () => {
    // An "edits" array that never arrived (e.g. a call written against a
    // different schema) must not read as "applied 0 edit(s)".
    const s = summarizeLineEdits([]);
    expect(s).toMatch(/Nothing was changed/);
    expect(s).not.toMatch(/^OK/);
  });

  it('names each problem', () => {
    const { outcomes } = applyLineEdits(doc, [
      { start: 1, end: 1, content: 'A' },
      { start: 99, end: 99, content: 'x' },
    ]);
    const s = summarizeLineEdits(outcomes);
    expect(s).toContain('Applied 1 of 2 edit(s)');
    expect(s).toContain('FAILED line 99');
  });
});

describe('lineEditsToRanges — line edits as source ranges', () => {
  it('produces ranges that apply identically to applyLineEdits', () => {
    const cases: LineEdit[][] = [
      [{ start: 2, end: 2, content: 'B' }],
      [{ start: 2, end: 2, content: 'B1\nB2\nB3' }, { start: 4, end: 4, content: 'D' }],
      [{ start: 2, end: 3, content: '' }],
      [{ start: 5, end: 5, content: 'E' }],
      [{ start: 1, end: 1, content: 'A' }, { start: 3, end: 3, content: 'C' }, { start: 5, end: 5, content: 'E' }],
      [{ start: 2, end: 99, content: 'X' }],
    ];
    for (const edits of cases) {
      const viaLines = applyLineEdits(doc, edits).svg;
      const { ranges } = lineEditsToRanges(doc, edits);
      expect(applyRanges(doc, ranges)).toBe(viaLines);
    }
  });

  it('carries the same outcomes, including refusals', () => {
    const edits: LineEdit[] = [
      { start: 1, end: 1, content: 'A' },
      { start: 99, end: 99, content: 'nope' },
    ];
    const { ranges, outcomes } = lineEditsToRanges(doc, edits);
    expect(outcomes.map((o) => o.status)).toEqual(['applied', 'failed']);
    expect(ranges).toHaveLength(1);
  });

  it('lets a line edit and a structural edit be conflict-checked together', () => {
    const { ranges } = lineEditsToRanges(doc, [{ start: 2, end: 2, content: 'B' }]);
    const overlapping = [...ranges, { start: ranges[0].start + 1, end: ranges[0].end, replacement: 'x' }];
    expect(conflictingRanges(overlapping)).toEqual([1]);
  });

  it('reports no conflict for disjoint ranges', () => {
    const { ranges } = lineEditsToRanges(doc, [
      { start: 1, end: 1, content: 'A' },
      { start: 3, end: 3, content: 'C' },
    ]);
    expect(conflictingRanges(ranges)).toEqual([]);
  });
});

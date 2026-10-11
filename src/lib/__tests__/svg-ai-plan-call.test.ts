import { describe, it, expect } from 'vitest';
import { planEditCall, CLIP_MARKER } from '../svg-ai';
import { embeddedToken } from '../embedded-data';

/**
 * planEditCall is the one place an edit call is resolved and refused, for the editor's chat and
 * the MCP server alike, so a refusal rule added for one reaches the other.
 */

const PHOTO = `data:image/png;base64,${'iVBORw0KGgoAAAANSUhEUg'.repeat(200)}`;
const DOC = [
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100">',
  `  <image id="photo" width="50" height="50" xlink:href="${PHOTO}"/>`,
  '  <rect id="box" x="10" y="10" width="30" height="30" fill="red"/>',
  '</svg>',
].join('\n');

describe('planEditCall', () => {
  it('refuses markup copied from a clipped line, for every edit tool including replace_svg', () => {
    const clipped = `<rect id="box" [... 12 ${CLIP_MARKER} ...]`;
    for (const [name, args] of [
      ['replace_svg', { svg: `<svg>${clipped}</svg>` }],
      ['replace_lines', { edits: [{ start: 3, end: 3, content: clipped }] }],
      ['insert_element', { edits: [{ selector: '#box', position: 'after', svg: clipped }] }],
    ] as const) {
      const plan = planEditCall(DOC, name, args);
      expect(plan.kind, name).toBe('refused');
    }
  });

  it('restores embedded data the model copied as a token', () => {
    const svg = `<svg><image xlink:href="${embeddedToken(PHOTO)}"/></svg>`;
    expect(planEditCall(DOC, 'replace_svg', { svg })).toEqual({
      kind: 'replace',
      svg: `<svg><image xlink:href="${PHOTO}"/></svg>`,
    });
  });

  it('refuses a token the document does not hold', () => {
    const plan = planEditCall(DOC, 'set_attribute', {
      edits: [{ selector: '#photo', name: 'href', value: '⟦embedded image/png 3 KB #deadbeef⟧' }],
    });
    expect(plan.kind).toBe('refused');
  });

  it('plans structural and line edits', () => {
    const structural = planEditCall(DOC, 'set_attribute', { edits: [{ selector: '#box', name: 'fill', value: 'blue' }] });
    expect(structural.kind === 'planned' && structural.planned[0].status).toBe('applied');
    const lines = planEditCall(DOC, 'replace_lines', { start: 3, end: 3, content: '  <circle r="5"/>' });
    expect(lines.kind === 'planned' && lines.planned[0].status).toBe('applied');
  });

  it('refuses structural edits while the document does not parse', () => {
    const plan = planEditCall('<svg><g>', 'set_attribute', { edits: [{ selector: 'g', name: 'fill', value: 'red' }] });
    expect(plan.kind).toBe('refused');
  });
});

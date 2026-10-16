import { describe, it, expect } from 'vitest';
import { replan } from '../replan';
import { applyPlannedBatches, planEditCall, type PlannedEdit } from '../svg-ai';

/**
 * Rejecting one card of several used to throw the whole turn away, because each card holds the
 * drawing with every edit of the turn up to its own. replan plans the others again, against the
 * snapshot they were all planned on, without the rejected one.
 */
const SNAPSHOT = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
  '  <rect id="a" width="10" height="10" fill="red"/>',
  '  <circle id="b" r="5" fill="blue"/>',
  '  <text id="c">Hello</text>',
  '</svg>',
].join('\n');

const CALLS = [
  { name: 'set_attribute', args: { edits: [{ selector: '#a', name: 'fill', value: 'green' }], summary: 'a green' } },
  { name: 'set_text', args: { edits: [{ selector: '#c', text: 'Hallo' }] } },
  { name: 'replace_lines', args: { edits: [{ start: 3, end: 3, content: '  <circle id="b" r="8" fill="blue"/>' }] } },
];

/** The cards as the editor holds them: each with the drawing after its own edit and the ones before. */
function cards() {
  const batches = CALLS.map((c) => (planEditCall(SNAPSHOT, c.name, c.args) as { planned: PlannedEdit[] }).planned);
  const { svgAfter } = applyPlannedBatches(SNAPSHOT, batches);
  return CALLS.map((c, i) => ({ name: c.name, args: { ...c.args, svg: svgAfter[i], warnings: ['x'] } }));
}

describe('replan', () => {
  it('gives the cards left after one is rejected without its change, each with the ones before it', () => {
    const [first, , third] = cards();
    const svgs = replan(SNAPSHOT, [first, third])!;
    expect(svgs).toHaveLength(2);
    expect(svgs[0]).toContain('fill="green"');
    expect(svgs[1]).toContain('fill="green"');
    expect(svgs[1]).toContain('r="8"');
    // The rejected text change is in neither.
    expect(svgs[1]).toContain('>Hello<');
  });

  it('keeps line edits pointing where they did: all were planned on the same snapshot', () => {
    const [, second, third] = cards();
    const svgs = replan(SNAPSHOT, [second, third])!;
    expect(svgs[1]).toContain('  <circle id="b" r="8" fill="blue"/>');
    expect(svgs[1]).toContain('fill="red"');
  });

  it('gives up on a call it cannot plan again, so the cards stay as they were', () => {
    expect(replan(SNAPSHOT, [{ name: 'replace_svg', args: { svg: '<svg/>' } }])).toBeNull();
    expect(replan(SNAPSHOT, [{ name: 'generate_image', args: { prompt: 'x' } }])).toBeNull();
  });
});

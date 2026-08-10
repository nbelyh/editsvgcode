import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ChatComposer } from '../../components/aichat/ChatComposer';
import { addressForLineRange } from '../svg-dom';

/**
 * The selection badge names the element the next request will land on.
 *
 * It used to render the open tag, which shows whichever attribute comes first
 * in source order — on a traced drawing that is the path data, so every
 * selected <path> read the same and identified nothing. It now shows the
 * address the model is given, which is the string that decides the edit.
 */

const props = {
  input: '',
  onInputChange: () => {},
  onSend: () => {},
  onStop: () => {},
  isRunning: false,
  hasPending: false,
  model: 'gpt-5.4-mini',
  onModelChange: () => {},
  imageModel: 'gpt-image-1-mini',
  onImageModelChange: () => {},
  effort: undefined,
  supportedEfforts: undefined,
  onEffortChange: () => {},
  credits: null,
  isModelDisabled: () => false,
  history: [],
};

const renderComposer = (over: Partial<React.ComponentProps<typeof ChatComposer>>) =>
  render(<MantineProvider><ChatComposer {...props} {...over} /></MantineProvider>);

describe('ChatComposer — the selection badge', () => {
  it('shows the address rather than the markup', () => {
    renderComposer({ selectedElement: '<rect fill="#ff0000"/>', selectedAddress: '/svg[1]/rect[2]' });
    expect(screen.getByText('/svg[1]/rect[2]')).toBeInTheDocument();
  });

  it('distinguishes two traced paths the open tag could not tell apart', () => {
    // Both begin "<path d="M0 0 C…" and differ only in their colour, which sits
    // past the 60 characters the old badge had room for.
    const traced = [
      '<svg xmlns="http://www.w3.org/2000/svg">',
      '<path d="M0 0 C5 3 9 7 14 10 C32 23 47 36 61 50 Z " style="fill: #1C1817;"/>',
      '<path d="M0 0 C4 2 6 4 9 7 C12 9 13 11 15 12 Z " style="fill: #FED748;"/>',
      '</svg>',
    ].join('\n');

    const first = addressForLineRange(traced, { start: 2, end: 2 })!;
    const second = addressForLineRange(traced, { start: 3, end: 3 })!;
    expect(first).not.toBe(second);

    const { unmount } = renderComposer({ selectedElement: '<path d="M0 0 C5 3 9 7 14 10"/>', selectedAddress: first });
    expect(screen.getByText(first)).toBeInTheDocument();
    unmount();

    renderComposer({ selectedElement: '<path d="M0 0 C4 2 6 4 9 7"/>', selectedAddress: second });
    expect(screen.getByText(second)).toBeInTheDocument();
  });

  it('falls back to the open tag when no address could be derived', () => {
    // A document mid-edit does not parse, and a badge that vanishes while you
    // type is worse than one showing the markup.
    renderComposer({ selectedElement: '<rect id="box" fill="red"/>', selectedAddress: null });
    expect(screen.getByText('<rect id="box" fill="red"/>')).toBeInTheDocument();
  });

  it('shows nothing at all when there is no selection', () => {
    renderComposer({ selectedElement: undefined, selectedAddress: null });
    expect(screen.queryByText(/svg\[1\]/)).not.toBeInTheDocument();
  });
});

/**
 * The live e2e scope test waits on this badge by test id and asserts its exact
 * text, because a loose matcher there passes on Monaco's rendered source line
 * and lets the turn go out with no selection at all. Both halves of that
 * expectation are pinned here so the browser test cannot be silently wrong.
 */
describe('ChatComposer — what the live e2e scope test relies on', () => {
  // Byte-for-byte the document in e2e/ai-tools-live.spec.ts.
  const DOC = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">',
    '  <style type="text/css">.st1 {fill:#cdcdcd;stroke:#000000;stroke-width:0.24;}',
    '\t.st2 {font-size:1em;}</style>',
    '  <g id="table">',
    '    <rect id="box" class="st1" x="4" y="4" width="90" height="40"/>',
    '    <text id="title" class="st2" x="8" y="18">Customer</text>',
    '    <text id="cols" class="st2" x="8" y="30">PK<tspan x="8" dy="1.2em">CustomerID</tspan></text>',
    '  </g>',
    '</svg>',
  ].join('\n');

  it('resolves line 6 of that document to exactly "#title"', () => {
    const markup = DOC.split('\n')[5].trim();
    expect(addressForLineRange(DOC, { start: 6, end: 6 }, markup)).toBe('#title');
  });

  it('exposes the badge under the test id the e2e spec queries', () => {
    renderComposer({ selectedElement: '<text id="title"/>', selectedAddress: '#title' });
    expect(screen.getByTestId('selection-address')).toHaveTextContent('#title');
  });

  it('does not render the badge at all with nothing selected', () => {
    renderComposer({ selectedElement: undefined, selectedAddress: null });
    expect(screen.queryByTestId('selection-address')).not.toBeInTheDocument();
  });
});

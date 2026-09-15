import { describe, it, expect, vi } from 'vitest';

vi.mock('firebase/firestore', () => ({ addDoc: vi.fn(), collection: vi.fn(), serverTimestamp: vi.fn(), Timestamp: { fromMillis: vi.fn() } }));
vi.mock('firebase/auth', () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock('../firebase-app', () => ({ firebaseDb: {} }));

import { buildFeedbackRecord, drawingShownFor, failureOf, shouldRecordFeedback, transcriptOf, FEEDBACK_LIMITS, type FeedbackInput } from '../ai-feedback';
import type { DisplayMessage } from '../../components/aichat/types';

const DOC = '<svg xmlns="http://www.w3.org/2000/svg"><text id="title">Customer</text></svg>';
const PROPOSED = DOC.replace('Customer', 'Kunde');

const assistant = (over: Partial<DisplayMessage> = {}): DisplayMessage => ({
  role: 'assistant',
  content: 'Renamed it.',
  toolCalls: [{ name: 'set_text', arguments: { svg: PROPOSED }, status: 'pending' }] as DisplayMessage['toolCalls'],
  ...over,
});

const input = (over: Partial<FeedbackInput> = {}): FeedbackInput => ({
  kind: 'reject',
  fileId: 'f1',
  prompt: 'rename Customer to Kunde',
  model: 'gpt-5.4-mini',
  tier: 'free',
  svg: DOC,
  proposedSvg: PROPOSED,
  message: assistant(),
  history: [{ role: 'user', content: 'make the box blue' }, { role: 'assistant', content: 'Done.' }],
  ...over,
});

describe('which turns are kept', () => {
  it('keeps a free-tier turn, and a Pro turn only when it was shared', () => {
    expect(shouldRecordFeedback('free')).toBe(true);
    expect(shouldRecordFeedback('pro')).toBe(false);
    expect(shouldRecordFeedback('pro', true)).toBe(true);
  });

  it('keeps nothing while the tier is still unknown, unless the user shared it', () => {
    // Until credits load, a Pro account defaults to free; guessing would break the policy.
    expect(shouldRecordFeedback(null)).toBe(false);
    expect(shouldRecordFeedback(null, true)).toBe(true);
  });
});

describe('drawingShownFor', () => {
  it('is the accepted call’s undo snapshot once an edit of the turn was accepted', () => {
    const message = assistant({
      toolCalls: [
        { name: 'set_text', arguments: { svg: PROPOSED }, status: 'accepted', prevSvg: DOC },
        { name: 'set_attribute', arguments: { svg: PROPOSED }, status: 'pending' },
      ] as DisplayMessage['toolCalls'],
    });
    expect(drawingShownFor(message, PROPOSED)).toBe(DOC);
  });

  it('is the document on screen while nothing of the turn was accepted', () => {
    expect(drawingShownFor(assistant(), DOC)).toBe(DOC);
    expect(drawingShownFor(undefined, DOC)).toBe(DOC);
  });
});

describe('failureOf', () => {
  const call = (args: Record<string, unknown>) => [{ name: 'set_text', arguments: args, status: 'rejected' }] as DisplayMessage['toolCalls'];

  it('names the most serious thing that went wrong', () => {
    expect(failureOf(assistant({ toolCalls: call({ documentBroken: 'no longer parses', notExecuted: true }) }))).toBe('broken');
    expect(failureOf(assistant({ toolCalls: call({ notExecuted: true }) }))).toBe('refused');
    expect(failureOf(assistant({ toolCalls: call({ svg: PROPOSED, failedOperations: ['#nope: matched nothing'] }) }))).toBe('refused');
    expect(failureOf(assistant({ outOfToolRounds: true }))).toBe('out_of_rounds');
  });

  it('finds nothing in a turn that went as planned', () => {
    expect(failureOf(assistant())).toBeNull();
    expect(failureOf(assistant({ toolCalls: call({ svg: PROPOSED, warnings: [] }) }))).toBeNull();
  });
});

describe('buildFeedbackRecord', () => {
  it('copies the request, the drawing, the proposal and the conversation', () => {
    const record = buildFeedbackRecord(input(), 'u1');
    expect(record).toMatchObject({
      uid: 'u1', fileId: 'f1', kind: 'reject', tier: 'free', shared: false, model: 'gpt-5.4-mini',
      prompt: 'rename Customer to Kunde', response: 'Renamed it.',
      tools: [{ name: 'set_text', status: 'pending' }],
      svg: DOC, svgChars: DOC.length, svgTruncated: false,
      proposedSvg: PROPOSED, proposedSvgChars: PROPOSED.length,
    });
    expect(JSON.parse(record.chat as string)).toEqual([
      { role: 'user', content: 'make the box blue' },
      { role: 'assistant', content: 'Done.' },
    ]);
  });

  it('says so when the tier was not known', () => {
    expect(buildFeedbackRecord(input({ tier: null, shared: true }), 'u1')).toMatchObject({ tier: 'unknown', shared: true });
  });

  it('leaves optional fields out rather than writing nulls', () => {
    const record = buildFeedbackRecord(input({ proposedSvg: undefined }), 'u1');
    expect(record).not.toHaveProperty('effort');
    expect(record).not.toHaveProperty('error');
    expect(record).not.toHaveProperty('proposedSvg');
  });

  it('keeps what the client reported going wrong', () => {
    const record = buildFeedbackRecord(input({
      kind: 'refused',
      message: assistant({
        toolCalls: [{ name: 'set_attribute', arguments: { notExecuted: true, failedOperations: ['#nope: matched nothing'] }, status: 'rejected' }] as DisplayMessage['toolCalls'],
        readToolCalls: [{ name: 'query', args: {}, result: 'matched 0 elements' }],
      }),
    }), 'u1');
    expect(record.tools).toEqual([{ name: 'set_attribute', status: 'rejected', notExecuted: true }]);
    expect(record.notes).toEqual(['set_attribute: #nope: matched nothing', 'query → matched 0 elements']);
  });

  it('cuts a drawing too large to store, says so, and gives up the proposal before the drawing', () => {
    const huge = `<svg>${'x'.repeat(FEEDBACK_LIMITS.svg)}</svg>`;
    const record = buildFeedbackRecord(input({ svg: huge, proposedSvg: huge }), 'u1');
    expect((record.svg as string).length).toBe(FEEDBACK_LIMITS.svg);
    expect(record).toMatchObject({ svgTruncated: true, svgChars: huge.length, proposedSvgChars: huge.length });
    expect(record).not.toHaveProperty('proposedSvg');
  });
});

describe('transcriptOf', () => {
  it('drops the oldest messages first when the conversation does not fit', () => {
    const history: DisplayMessage[] = [
      { role: 'user', content: 'a'.repeat(100) },
      { role: 'assistant', content: 'b'.repeat(100) },
      { role: 'user', content: 'the latest' },
    ];
    const kept = JSON.parse(transcriptOf(history, 80)) as Array<{ content: string }>;
    expect(kept.map((m) => m.content)).toEqual(['the latest']);
  });
});

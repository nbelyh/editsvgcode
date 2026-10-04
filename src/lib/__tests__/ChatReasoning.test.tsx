import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

vi.mock('firebase/auth', () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock('../analytics', () => ({ trackBeginCheckout: vi.fn() }));
vi.mock('../../components/ToolCallProposal', () => ({ ToolCallProposal: () => null }));
vi.mock('../../components/CreditsIndicator', () => ({ BUY_CREDITS_URL: '/pricing' }));

import { ChatThread } from '../../components/aichat/ChatThread';
import type { DisplayMessage } from '../../components/aichat/types';
import { createLiveReplyStore } from '../live-reply';

/**
 * Reasoning streams in while a call runs, and the finished message keeps it for the session —
 * collapsed, so it stays out of the way of the answer. While the call runs, the live bubble
 * reads the store directly rather than taking the text as props.
 */

// Frames run at once here, so what a test appends is on screen by the next assertion.
beforeAll(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 0;
  });
});
afterAll(() => vi.unstubAllGlobals());

const noop = () => {};
const baseProps = (): React.ComponentProps<typeof ChatThread> => ({
  messages: [],
  isRunning: false,
  progressStatus: 'thinking',
  live: createLiveReplyStore(),
  canUndo: false,
  viewportRef: { current: null },
  onAccept: noop, onReject: noop, onUpdateToolCallSvg: noop, onUndoAccept: noop, onRestore: noop,
  onThumbsUp: noop, onThumbsDown: noop, onContinue: noop, onRetry: noop,
  hasPending: false,
  editingIndex: null, editingText: '', onEditStart: noop, onEditChange: noop, onEditSubmit: noop, onEditCancel: noop,
  iconPickIcons: null, iconPickSelected: null, onIconSelect: noop, onIconMore: noop, onIconNone: noop,
  imageConfirmSummary: null, imageCredits: 10, onImageConfirm: noop, onImageDecline: noop,
  onSamplePrompt: noop, onPasteSvg: noop, canPaste: true, isAnonymous: false, isViewer: false,
});

const renderThread = (over: Partial<React.ComponentProps<typeof ChatThread>>) =>
  render(<MantineProvider><ChatThread {...baseProps()} {...over} /></MantineProvider>);

const turn = (assistant: DisplayMessage): DisplayMessage[] => [{ role: 'user', content: 'Translate the labels' }, assistant];
const running: DisplayMessage[] = [{ role: 'user', content: 'Translate the labels' }];

describe('ChatThread — reasoning', () => {
  it('keeps a finished turn’s reasoning, collapsed until asked for', () => {
    renderThread({
      messages: turn({ role: 'assistant', content: 'Translated six labels.', reasoning: 'The drawing has six text elements.' }),
    });

    expect(screen.getByText('Translated six labels.')).toBeInTheDocument();
    expect(screen.queryByText('The drawing has six text elements.')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reasoning/ }));
    expect(screen.getByText('The drawing has six text elements.')).toBeInTheDocument();
  });

  it('keeps it on a turn that answered with edits alone', () => {
    renderThread({
      messages: turn({
        role: 'assistant',
        content: '',
        reasoning: 'Only the fill needs to change.',
        toolCalls: [{ name: 'set_attribute', arguments: {}, status: 'pending' }] as DisplayMessage['toolCalls'],
      }),
    });
    expect(screen.getByRole('button', { name: /Reasoning/ })).toBeInTheDocument();
  });

  it('shows no toggle for a turn without reasoning', () => {
    renderThread({ messages: turn({ role: 'assistant', content: 'Done.' }) });
    expect(screen.queryByRole('button', { name: /Reasoning/ })).not.toBeInTheDocument();
  });

  it('shows the paragraph the model is on while it is still thinking', () => {
    const live = createLiveReplyStore();
    live.appendReasoning('\n\nFinding the labels\n\nChecking which ones are German');
    renderThread({ messages: running, isRunning: true, live });

    expect(screen.getByText('Checking which ones are German')).toBeInTheDocument();
    expect(screen.queryByText('Finding the labels')).not.toBeInTheDocument();
  });

  it('shows the answer in place of the reasoning once text streams in', () => {
    const live = createLiveReplyStore();
    const grew = vi.fn();
    live.appendReasoning('Checking which ones are German');
    renderThread({ messages: running, isRunning: true, live, onLiveGrow: grew });
    grew.mockClear();

    act(() => live.appendText('Translating six labels'));

    expect(screen.getByText('Translating six labels')).toBeInTheDocument();
    expect(screen.queryByText('Checking which ones are German')).not.toBeInTheDocument();
    expect(grew).toHaveBeenCalled(); // so the thread can follow the end
  });
});

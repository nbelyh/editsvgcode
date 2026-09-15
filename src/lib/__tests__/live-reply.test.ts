// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLiveReplyStore } from '../live-reply';

/** Frames run only when the test says so; a cancelled one is replaced with a no-op. */
let frames: FrameRequestCallback[] = [];
const runFrame = () => {
  const due = frames;
  frames = [];
  due.forEach((callback) => callback(0));
};

beforeEach(() => {
  frames = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback));
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames[id - 1] = () => {};
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('live reply store', () => {
  it('tells subscribers once per frame, however many deltas arrived', () => {
    const live = createLiveReplyStore();
    const heard = vi.fn();
    live.subscribe(heard);

    live.appendReasoning('Plan');
    live.appendReasoning('ning');
    live.appendText('Do');
    live.appendText('ne');
    expect(heard).not.toHaveBeenCalled();
    expect(live.getSnapshot()).toEqual({ text: '', reasoning: '' });

    runFrame();
    expect(heard).toHaveBeenCalledTimes(1);
    expect(live.getSnapshot()).toEqual({ text: 'Done', reasoning: 'Planning' });
  });

  it('hands out the same snapshot until it changes, as useSyncExternalStore requires', () => {
    const live = createLiveReplyStore();
    live.appendText('a');
    runFrame();
    expect(live.getSnapshot()).toBe(live.getSnapshot());
  });

  it('clears at once on reset, and drops text still waiting for its frame', () => {
    const live = createLiveReplyStore();
    const heard = vi.fn();
    live.subscribe(heard);
    live.appendText('old');
    runFrame();

    live.appendText(' and more');
    live.reset();
    expect(live.getSnapshot()).toEqual({ text: '', reasoning: '' });

    runFrame();
    expect(live.getSnapshot()).toEqual({ text: '', reasoning: '' });
    expect(heard).toHaveBeenCalledTimes(2); // the first frame, then the reset
  });

  it('stops telling a listener that unsubscribed', () => {
    const live = createLiveReplyStore();
    const heard = vi.fn();
    const unsubscribe = live.subscribe(heard);
    unsubscribe();
    live.appendText('x');
    runFrame();
    expect(heard).not.toHaveBeenCalled();
  });
});

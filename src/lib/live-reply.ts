/**
 * The reply a model call is streaming, kept outside React state.
 *
 * Deltas arrive tens of times a second. Held as AiChat state, each one re-rendered the whole
 * panel — every earlier answer re-parsing its markdown, the composer and its model picker
 * reconciling — for text that only the bubble at the bottom shows. Here they collect in
 * plain fields and subscribers hear about them at most once per animation frame, so only the
 * live bubble re-renders, and no more often than the screen can show it.
 */

export interface LiveSnapshot {
  text: string;
  reasoning: string;
}

export interface LiveReplyStore {
  /** For useSyncExternalStore: the same object until something visible has changed. */
  getSnapshot(): LiveSnapshot;
  subscribe(listener: () => void): () => void;
  appendText(delta: string): void;
  appendReasoning(delta: string): void;
  /** Back to nothing, straight away — a new call has started, or the turn is over. */
  reset(): void;
}

const EMPTY: LiveSnapshot = { text: '', reasoning: '' };

export function createLiveReplyStore(): LiveReplyStore {
  let snapshot = EMPTY;
  let pending: LiveSnapshot | null = null;
  // Whether a flush is booked is tracked apart from the frame id: an implementation that runs
  // the callback before returning (a test double, or a polyfill) would otherwise have its id
  // written back after the flush had cleared it, and no frame would ever be booked again.
  let scheduled = false;
  let frame: number | null = null;
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((listener) => listener());
  const flush = () => {
    scheduled = false;
    frame = null;
    if (!pending) return;
    snapshot = pending;
    pending = null;
    notify();
  };
  const schedule = (next: LiveSnapshot) => {
    pending = next;
    if (scheduled) return;
    scheduled = true;
    const id = requestAnimationFrame(flush);
    if (scheduled) frame = id;
  };
  const latest = () => pending ?? snapshot;

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    appendText(delta) {
      if (delta) schedule({ ...latest(), text: latest().text + delta });
    },
    appendReasoning(delta) {
      if (delta) schedule({ ...latest(), reasoning: latest().reasoning + delta });
    },
    reset() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      scheduled = false;
      pending = null;
      if (snapshot === EMPTY) return;
      snapshot = EMPTY;
      notify();
    },
  };
}

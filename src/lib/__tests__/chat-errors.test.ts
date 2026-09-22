import { describe, it, expect } from 'vitest';
import { describeChatError } from '../chat-errors';

/** Most failed turns were dropped connections, shown as the browser's own words. */
describe('describeChatError', () => {
  it('says a dropped connection changed nothing, in every browser’s wording, and offers Retry', () => {
    for (const raw of ['network error', 'Failed to fetch', 'NetworkError when attempting to fetch resource.', 'Load failed', 'The network connection was lost.']) {
      const shown = describeChatError(raw);
      expect(shown.text, raw).toContain('your drawing is unchanged');
      expect(shown.retry, raw).toBe(true);
    }
  });

  it('explains a request the content filter blocked, and does not offer the same request again', () => {
    const shown = describeChatError('400 Your request was rejected by the safety system. If you believe this is an error, contact us');
    expect(shown.text).toContain('content filter');
    expect(shown.retry).toBe(false);
  });

  it('shows anything else as it was reported', () => {
    expect(describeChatError('The model service failed: overloaded')).toEqual({ text: 'Error: The model service failed: overloaded', retry: true });
  });
});

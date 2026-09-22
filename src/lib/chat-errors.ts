/**
 * What the user reads when a chat request fails, in place of the browser's own words.
 *
 * Most failed turns were the connection dropping part-way — phones switching apps while the
 * reply streamed — and the user read "Error: network error", "Failed to fetch" or "Load failed",
 * none of which says whether the drawing was touched or what to do next. The raw message still
 * goes into the failure record; this is only what is shown.
 */

export interface ChatErrorView {
  text: string;
  /** Sending the same request again may well work, so offer it. */
  retry: boolean;
}

// Chrome, Firefox and Safari, in that order, for a request or a stream cut off mid-way.
const DROPPED = /network error|failed to fetch|networkerror when attempting|load failed|network connection was lost/i;
const FILTERED = /safety system|content[ _]?filter|responsibleai/i;

export function describeChatError(message: string): ChatErrorView {
  if (DROPPED.test(message)) {
    return {
      text: 'The connection dropped before the reply arrived, so your drawing is unchanged. This happens most when the app is left in the background while it works. Press Retry to send it again.',
      retry: true,
    };
  }
  if (FILTERED.test(message)) {
    return {
      text: "The AI provider's content filter blocked this request, so nothing was changed. Try describing what you want differently — for example without naming a well-known character or brand.",
      retry: false,
    };
  }
  return { text: `Error: ${message}`, retry: true };
}

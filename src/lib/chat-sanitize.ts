/**
 * Drop function_call items that never received a function_call_output — a turn
 * that ended before executing them (e.g. chats saved before the decline-loop
 * fix left unanswered search_svg calls behind). Replaying such items makes the
 * API reject the whole request. Reasoning items orphaned by the removal are
 * dropped too, since the API requires each reasoning item to be followed by an
 * item from the same response (its paired function_call or message).
 */
export function sanitizeHistory(history: unknown[]): unknown[] {
  type Item = { type?: string; call_id?: string };
  const answered = new Set(
    history.filter((i) => (i as Item).type === 'function_call_output').map((i) => (i as Item).call_id)
  );
  const kept = history.filter(
    (i) => (i as Item).type !== 'function_call' || answered.has((i as Item).call_id)
  );
  return kept.filter((item, i) => {
    if ((item as Item).type !== 'reasoning') return true;
    const next = kept[i + 1] as Item | undefined;
    return next !== undefined && (next.type === 'function_call' || next.type === 'message');
  });
}

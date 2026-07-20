import { describe, it, expect } from 'vitest';
import { sanitizeHistory } from '../chat-sanitize';

// ---------------------------------------------------------------------------
// sanitizeHistory — repairs histories saved by the pre-fix decline flow, where
// a turn ended with unanswered function_call items (and their reasoning item).
// Replaying those makes the API reject the whole request.
// ---------------------------------------------------------------------------

const user = (content: string) => ({ role: 'user', content });
const reasoning = (id: string) => ({ id, type: 'reasoning', content: [], summary: [] });
const call = (call_id: string, name: string) => ({ type: 'function_call', call_id, name, arguments: '{}' });
const output = (call_id: string) => ({ type: 'function_call_output', call_id, output: 'OK' });
const message = (text: string) => ({ type: 'message', content: [{ type: 'output_text', text }] });

describe('sanitizeHistory', () => {
  it('keeps a healthy history unchanged', () => {
    const history = [
      user('draw a horse'),
      reasoning('rs_1'),
      call('c1', 'search_svg'),
      output('c1'),
      reasoning('rs_2'),
      message('done'),
    ];
    expect(sanitizeHistory(history)).toEqual(history);
  });

  it('drops unanswered function calls and their orphaned reasoning item', () => {
    // Shape saved by the buggy decline flow: modify_image answered with the
    // rejection, then reasoning + search_svg calls that never got outputs.
    const history = [
      user('make the horse more brown'),
      reasoning('rs_1'),
      call('c1', 'modify_image'),
      output('c1'),
      reasoning('rs_2'),
      call('c2', 'search_svg'),
      call('c3', 'search_svg'),
      call('c4', 'search_svg'),
    ];
    expect(sanitizeHistory(history)).toEqual([
      user('make the horse more brown'),
      reasoning('rs_1'),
      call('c1', 'modify_image'),
      output('c1'),
    ]);
  });

  it('keeps reasoning followed by a message even when trailing calls are dropped', () => {
    const history = [
      reasoning('rs_1'),
      message('working on it'),
      call('c1', 'search_svg'), // unanswered
    ];
    expect(sanitizeHistory(history)).toEqual([reasoning('rs_1'), message('working on it')]);
  });

  it('drops consecutive orphaned reasoning items', () => {
    const history = [
      user('hi'),
      reasoning('rs_1'),
      reasoning('rs_2'),
      call('c1', 'search_svg'), // unanswered → rs_2 orphaned → rs_1 orphaned too
    ];
    expect(sanitizeHistory(history)).toEqual([user('hi')]);
  });

  it('handles plain role messages without a type field', () => {
    const history = [user('hello'), { role: 'developer', content: 'context' }];
    expect(sanitizeHistory(history)).toEqual(history);
  });
});

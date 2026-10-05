import { describe, it, expect, vi } from 'vitest';

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(), getDoc: vi.fn(), setDoc: vi.fn(), collection: vi.fn(), getDocs: vi.fn(),
  query: vi.fn(), orderBy: vi.fn(), writeBatch: vi.fn(), serverTimestamp: vi.fn(),
}));
vi.mock('firebase/storage', () => ({ ref: vi.fn(), uploadBytes: vi.fn(), getBytes: vi.fn() }));
vi.mock('firebase/auth', () => ({ getAuth: () => ({ currentUser: null }) }));
vi.mock('../firebase-app', () => ({ firebaseDb: {}, firebaseStorage: {} }));
vi.mock('../chat-storage', () => ({ loadLegacyChatMessages: vi.fn(), clearLegacyChatMessages: vi.fn() }));

import { toStored, fromStored } from '../chat-history';

/**
 * A shared document's chat is readable by anyone with the link, and a model's reasoning can
 * restate the server's instructions — the stars chat quoted a routing rule back verbatim. So
 * reasoning is kept for the session only, and none of it may reach the saved payload: neither
 * the message's own reasoning nor the summary text inside the replay items.
 */
describe('chat history — reasoning stays out of the saved chat', () => {
  it('does not save a message’s reasoning', async () => {
    const stored = await toStored(
      { role: 'assistant', content: 'Translated.', reasoning: 'Intent #2 says search icons first.' },
      3,
    );
    expect(stored.payload).not.toContain('Intent #2');
    expect((await fromStored(stored)).reasoning).toBeUndefined();
  });

  it('saves reasoning items without their summary text', async () => {
    const stored = await toStored({
      role: 'assistant',
      content: '',
      rawItems: [
        { type: 'reasoning', id: 'rs_1', summary: [{ type: 'summary_text', text: 'Intent #2 says search icons first.' }] },
        { type: 'function_call', call_id: 'c1', name: 'insert_element', arguments: '{}' },
      ],
    }, 4);
    expect(stored.payload).not.toContain('Intent #2');
    expect((await fromStored(stored)).rawItems).toEqual([
      { type: 'reasoning', id: 'rs_1', summary: [] },
      { type: 'function_call', call_id: 'c1', name: 'insert_element', arguments: '{}' },
    ]);
  });
});

describe('chat history — pictures stay out of the saved chat', () => {
  it('does not save a get_png_image picture', async () => {
    // Firestore documents are capped at 1 MiB and chats are copied into forks, so a
    // picture that reached rawItems by mistake must still not reach the payload.
    const stored = await toStored({
      role: 'assistant',
      content: 'Done.',
      rawItems: [
        { type: 'function_call', call_id: 'c1', name: 'get_png_image', arguments: '{}' },
        { type: 'function_call_output', call_id: 'c1', output: '512×512 PNG' },
        { role: 'user', content: [{ type: 'input_text', text: 'look' }, { type: 'input_image', image_url: 'data:image/png;base64,AAAA' }] },
      ],
    }, 5);
    expect(stored.payload).not.toContain('input_image');
    expect((await fromStored(stored)).rawItems).toEqual([
      { type: 'function_call', call_id: 'c1', name: 'get_png_image', arguments: '{}' },
      { type: 'function_call_output', call_id: 'c1', output: '512×512 PNG' },
    ]);
  });
});

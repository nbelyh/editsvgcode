import { describe, it, expect } from 'vitest';
import { pictureItem, withPictures, withoutPictures, DROPPED_PICTURE_NOTE } from '../chat-pictures';

const call = (id: string) => ({ type: 'function_call', call_id: id, name: 'get_png_image', arguments: '{}' });
const output = (id: string) => ({ type: 'function_call_output', call_id: id, output: '512×512 PNG' });
const picture = (n: number) => pictureItem(`look ${n}`, `data:image/png;base64,P${n}`);
const dropped = { role: 'user', content: DROPPED_PICTURE_NOTE };

describe('withPictures', () => {
  it('puts each picture after the tool results of its own round', () => {
    // Two rounds: the first picture belongs after c1's output, not at the end, so the
    // transcript keeps its order and its prefix stays the same from round to round.
    const items = [call('c1'), output('c1'), call('c2'), output('c2')];
    const pictures = [{ at: 2, item: picture(1) }, { at: 4, item: picture(2) }];
    expect(withPictures(items, pictures)).toEqual([
      call('c1'), output('c1'), picture(1), call('c2'), output('c2'), picture(2),
    ]);
  });

  it('keeps the latest two pictures and replaces older ones with a note', () => {
    const items = [call('c1'), output('c1'), call('c2'), output('c2'), call('c3'), output('c3')];
    const pictures = [{ at: 2, item: picture(1) }, { at: 4, item: picture(2) }, { at: 6, item: picture(3) }];
    expect(withPictures(items, pictures)).toEqual([
      call('c1'), output('c1'), dropped, call('c2'), output('c2'), picture(2), call('c3'), output('c3'), picture(3),
    ]);
  });

  it('keeps several pictures from one round together, in order', () => {
    const items = [call('c1'), call('c2'), output('c1'), output('c2')];
    const pictures = [{ at: 4, item: picture(1) }, { at: 4, item: picture(2) }];
    expect(withPictures(items, pictures)).toEqual([...items, picture(1), picture(2)]);
  });

  it('leaves a turn without pictures as it is', () => {
    const items = [call('c1'), output('c1')];
    expect(withPictures(items, [])).toEqual(items);
  });
});

describe('withoutPictures', () => {
  it('takes picture items out and leaves everything else', () => {
    const items = [call('c1'), output('c1'), picture(1), { role: 'user', content: 'hello' }];
    expect(withoutPictures(items)).toEqual([call('c1'), output('c1'), { role: 'user', content: 'hello' }]);
  });
});

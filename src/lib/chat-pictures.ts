/**
 * Pictures from get_png_image on their way to the model, and never anywhere else.
 *
 * A picture rides as its own user item after the tool results of its round, not inside the
 * function_call_output: the output stays text everywhere, which every route accepts and
 * the Claude route converts as it always has. (VSU's sidebar settled on the same shape.)
 *
 * A picture is sent and not kept. The turn's raw output is saved and replayed on every
 * later turn, and a picture there would be re-uploaded for the rest of the conversation,
 * bloat a Firestore document limited to 1 MiB, and show the drawing as it WAS. So pictures
 * live in their own list for the turn and are spliced into each continuation request only.
 * Within the turn the older ones are dropped too: every round re-sends everything, and a
 * turn may look many times.
 */

export interface TurnPicture {
  /** Where it goes: after this many items of the turn's raw output. */
  at: number;
  item: unknown;
}

/** How many pictures a continuation carries in full; older ones become a note. */
export const KEEP_PICTURES = 2;

export const DROPPED_PICTURE_NOTE =
  '[Image removed: a newer look follows. Call get_png_image again if you need this one.]';

export function pictureItem(caption: string, dataUrl: string): unknown {
  return {
    role: 'user',
    content: [
      { type: 'input_text', text: `The picture from get_png_image: ${caption}` },
      { type: 'input_image', image_url: dataUrl },
    ],
  };
}

/**
 * The turn's raw output with its pictures in place, each one after the tool results of the
 * round that took it — so the transcript reads in the order things happened and its prefix
 * stays the same from one round to the next. All but the latest `keep` are replaced by a note.
 */
export function withPictures(items: unknown[], pictures: TurnPicture[], keep = KEEP_PICTURES): unknown[] {
  const cutoff = pictures.length - keep;
  const out: unknown[] = [];
  let next = 0;
  for (let i = 0; i <= items.length; i++) {
    while (next < pictures.length && pictures[next].at === i) {
      out.push(next < cutoff ? { role: 'user', content: DROPPED_PICTURE_NOTE } : pictures[next].item);
      next++;
    }
    if (i < items.length) out.push(items[i]);
  }
  return out;
}

function hasPicture(item: unknown): boolean {
  const content = (item as { content?: unknown })?.content;
  return Array.isArray(content) && content.some((part) => (part as { type?: unknown })?.type === 'input_image');
}

/** History with any picture item taken out. None should ever be there; this is the guard. */
export function withoutPictures(items: unknown[]): unknown[] {
  return items.some(hasPicture) ? items.filter((item) => !hasPicture(item)) : items;
}

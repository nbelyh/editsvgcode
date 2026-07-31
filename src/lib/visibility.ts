/**
 * File visibility: 'private' = owner only, 'unlisted' = anyone with the link
 * (the historic "public" semantic), 'public' = additionally listed in the
 * gallery. Legacy docs carry only the `private` boolean and map to
 * private/unlisted — never to 'public', so nothing gets listed without an
 * explicit opt-in.
 *
 * Kept free of firebase imports so it stays unit-testable (firebase.ts has
 * module-level side effects: app init, emulator connect, auth listeners).
 */
export type Visibility = 'private' | 'unlisted' | 'public';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function visibilityOf(data: any): Visibility {
  const v = data?.visibility;
  if (v === 'private' || v === 'unlisted' || v === 'public') return v;
  return data?.private === true ? 'private' : 'unlisted';
}

// ---------------------------------------------------------------------------
// All user-facing copy describing what each visibility (and publishing) means
// lives here, side by side, so the promise made to the user can't silently
// drift between the Share menu, notifications, and the publish dialog.
// ---------------------------------------------------------------------------

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  private: 'Private',
  unlisted: 'Unlisted',
  public: 'Public',
};

export const VISIBILITY_MESSAGE: Record<Visibility, string> = {
  private: 'Only you can view this file.',
  unlisted: 'Anyone with the link can view this file.',
  public: 'Listed in the public gallery — anyone can find and clone it.',
};

/** Share-menu description of the checked "Public" state. */
export const PUBLIC_STATE_DESCRIPTION = 'Listed in the gallery for anyone to find and clone';

/** Share-menu description of the "Publish to gallery…" action. */
export const PUBLISH_ACTION_DESCRIPTION = 'List this file in the public gallery';

/** Publish-dialog consent hint — the fullest statement of what going public exposes. */
export const PUBLISH_DIALOG_HINT =
  'Anyone can find this file in the public gallery, view it and its AI chat, and clone it. ' +
  'Your name and avatar are shown as the author.';

/** CC0 1.0 Universal — the licence every gallery entry is published under. */
export const CC0_URL = 'https://creativecommons.org/publicdomain/zero/1.0/';

/**
 * Licence terms shown before publishing. Stated at the point of the act, not
 * only in the Terms, because it is irrevocable for copies already taken:
 * unpublishing removes the listing, it cannot recall what others cloned.
 */
export const PUBLISH_LICENSE_HINT =
  'Publishing places this drawing in the public domain under CC0 1.0 — anyone may use, modify ' +
  'and redistribute it, including commercially, without asking or crediting you. You can ' +
  'unpublish it later, but copies already made stay free to use.';

/** Gallery header note, so visitors know what they may do with what they clone. */
export const GALLERY_LICENSE_NOTE =
  'Everything here is released under CC0 1.0 — free to use, modify and redistribute, including commercially.';

/**
 * Shown on somebody else's document. Each panel promises only what it governs:
 * the chat cannot be continued, and edits made in the editor cannot be saved
 * back to a file that is not ours.
 *
 * The opening sentence is repeated in full rather than shared and concatenated.
 * These are translatable strings: word order and agreement differ by language,
 * so a translator needs the whole sentence, not a stem plus a tail that happen
 * to join correctly in English. Do not "de-duplicate" these.
 */
export const FOREIGN_DOC_CHAT_NOTICE =
  "This is someone else's document. Make a copy to continue the chat.";
export const FOREIGN_DOC_INFO_NOTICE =
  "This is someone else's document. Make a copy to edit and save your own version.";

export const GALLERY_META_UPDATED = {
  title: 'Gallery info updated',
  message: 'The gallery card now shows the new title.',
};

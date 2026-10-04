/** Height of the application header, in pixels.
 *
 *  Shared because two places have to agree on it: <App>'s AppShell, which
 *  reserves the space, and the build-time prerender, which renders pages without
 *  <App> and has to leave the same gap or the content jumps when the real header
 *  mounts. A comment binding them was not enough — change one and the other goes
 *  quietly wrong. Importing it means the compiler notices.
 */
export const APP_SHELL_HEADER_HEIGHT = 50;

/** Media queries for the layout breakpoints. EditorPage picks its phone,
 *  tablet and desktop layouts by these, and App places the consent notice by
 *  them, so the two must agree; AiChat.css repeats PHONE_QUERY's width, since
 *  CSS cannot import it. */
export const PHONE_QUERY = '(max-width: 35.99em)';
export const DESKTOP_QUERY = '(min-width: 64em)';

/** Width of the AI chat column on the right of the tablet layout, which the
 *  cookie consent card keeps clear of. */
export const TABLET_CHAT_WIDTH = 320;

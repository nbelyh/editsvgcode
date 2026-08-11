/** Height of the application header, in pixels.
 *
 *  Shared because two places have to agree on it: <App>'s AppShell, which
 *  reserves the space, and the build-time prerender, which renders pages without
 *  <App> and has to leave the same gap or the content jumps when the real header
 *  mounts. A comment binding them was not enough — change one and the other goes
 *  quietly wrong. Importing it means the compiler notices.
 */
export const APP_SHELL_HEADER_HEIGHT = 50;

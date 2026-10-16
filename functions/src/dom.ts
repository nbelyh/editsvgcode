/**
 * The editing modules parse with the browser's `DOMParser` (and serialize with `XMLSerializer`), and Node has neither. jsdom's is the one
 * the editor's own tests run those modules under, so the server parses — and reports a
 * malformed document — the way the editor does.
 *
 * Imported on the first MCP call, not at load: the Functions host loads every endpoint's module
 * at startup, and jsdom is heavy enough to slow the cold start of endpoints that never need it.
 */
export async function installDom(): Promise<void> {
  const g = globalThis as { DOMParser?: unknown; XMLSerializer?: unknown };
  if (g.DOMParser && g.XMLSerializer) return;
  const { JSDOM } = await import("jsdom");
  const { window } = new JSDOM("");
  g.DOMParser ??= window.DOMParser;
  // The picture tools (render.ts, svg-snapshot.ts) write their layers back out as markup.
  g.XMLSerializer ??= window.XMLSerializer;
}

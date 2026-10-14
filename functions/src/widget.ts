import { readFile } from "node:fs/promises";

/**
 * The widget: the drawing shown in the chat, as an MCP App (the MCP "ui" extension). The
 * show_document tool names this resource; hosts that render MCP Apps load it into a sandboxed
 * iframe and hand it the tool's result. The page is src/mcp-widget/main.tsx in the editor,
 * bundled by scripts/build.mjs into lib/widget.html, script and styles inline.
 */
export const WIDGET_URI = "ui://editsvgcode/preview.html";
export const WIDGET_MIME_TYPE = "text/html;profile=mcp-app";

/**
 * The page fetches and loads nothing from outside: the drawing comes through the host bridge
 * (get_document_svg). Images a drawing links to from the web are blocked by the sandbox, as
 * they are not declared here.
 */
export const WIDGET_META = { ui: { csp: { connectDomains: [], resourceDomains: [] }, prefersBorder: true } };

let cached: Promise<string> | undefined;

/** lib/widget.html, next to the bundled server (lib/index.js), read once per instance. */
export function readWidgetHtml(): Promise<string> {
  cached ??= readFile(new URL("./widget.html", import.meta.url), "utf8").catch((err) => {
    cached = undefined;
    throw err;
  });
  return cached;
}

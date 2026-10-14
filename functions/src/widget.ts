import { readFile } from "node:fs/promises";

/**
 * The widget: the drawing shown in the chat, as an MCP App (the MCP "ui" extension). The
 * show_document tool names this resource; hosts that render MCP Apps load it into a sandboxed
 * iframe and hand it the tool's result. The page is src/mcp-widget/main.tsx in the editor,
 * bundled by scripts/build.mjs into lib/widget.html, script and styles inline.
 */
/** Set by scripts/build.mjs: a hash of lib/widget.html. Unset in tests. */
declare const __WIDGET_HASH__: string | undefined;

/**
 * The page's address carries a hash of its content: hosts cache a ui:// resource by its URI, and
 * Claude kept showing the first build's page after a deploy. A new page is a new address.
 */
export const WIDGET_URI = `ui://editsvgcode/preview-${typeof __WIDGET_HASH__ === "string" ? __WIDGET_HASH__ : "dev"}.html`;
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

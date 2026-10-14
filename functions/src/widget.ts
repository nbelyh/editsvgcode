import { readFile } from "node:fs/promises";

/**
 * The widgets: pages shown in the chat, as MCP Apps (the MCP "ui" extension). A tool names one
 * in _meta.ui.resourceUri; hosts that render MCP Apps load it into a sandboxed iframe and hand it
 * the tool's result. Each is built from the editor's source by scripts/build.mjs into one HTML
 * file under lib/, script and styles inline.
 *
 * - preview (src/mcp-widget/main.tsx): a drawing in the editor's Preview, and the picker of the
 *   user's drawings with a box to upload one.
 * - picture (src/mcp-widget/picture.tsx): the card that asks before a picture is made, then the
 *   picture traced into SVG with vtracer, with the tracer's settings.
 */

/** Set by scripts/build.mjs: a hash of each page. Unset in tests. */
declare const __WIDGET_HASHES__: Record<string, string> | undefined;

function hashOf(name: string): string {
  return typeof __WIDGET_HASHES__ === "object" ? __WIDGET_HASHES__[name] ?? "dev" : "dev";
}

/**
 * A page's address carries a hash of its content: hosts cache a ui:// resource by its URI, and
 * Claude kept showing the first build's page after a deploy. A new page is a new address.
 */
export const WIDGET_URI = `ui://editsvgcode/preview-${hashOf("preview")}.html`;
export const PICTURE_WIDGET_URI = `ui://editsvgcode/picture-${hashOf("picture")}.html`;
export const WIDGET_MIME_TYPE = "text/html;profile=mcp-app";

export interface WidgetPage {
  uri: string;
  name: string;
  file: string;
}

export const WIDGET_PAGES: WidgetPage[] = [
  { uri: WIDGET_URI, name: "Drawing preview", file: "widget.html" },
  { uri: PICTURE_WIDGET_URI, name: "Picture", file: "picture.html" },
];

/**
 * What a page may reach. The preview reaches nothing: drawings come through the host bridge
 * (get_document_svg). The picture page fetches its PNG from this function's picture links
 * (pictures.ts), straight from the origin given. Images a drawing links to from the web are
 * blocked by the sandbox, as they are not declared.
 */
export function widgetMeta(page: WidgetPage, pictureOrigin: string | null) {
  const connectDomains = page.uri === PICTURE_WIDGET_URI && pictureOrigin ? [pictureOrigin] : [];
  return { ui: { csp: { connectDomains, resourceDomains: [] }, prefersBorder: true } };
}

const cache = new Map<string, Promise<string>>();

/** lib/<file>, next to the bundled server (lib/index.js), read once per instance. */
export function readWidgetHtml(file: string): Promise<string> {
  let html = cache.get(file);
  if (!html) {
    html = readFile(new URL(`./${file}`, import.meta.url), "utf8");
    html.catch(() => cache.delete(file));
    cache.set(file, html);
  }
  return html;
}

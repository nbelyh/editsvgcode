import { AppBridge, PostMessageTransport } from "@modelcontextprotocol/ext-apps/app-bridge";

/**
 * A stand-in for a chat host (Claude, ChatGPT), to look at the MCP widget without deploying:
 * scripts/widget-preview.mjs bundles this into lib/widget-preview.html next to the widget page.
 * It loads the widget into a sandboxed iframe as hosts do, hands it a show_document result and
 * answers its get_document_svg call with the drawing chosen here instead of a stored document.
 */

declare const WIDGET_HTML: string;
declare const SAMPLE: { title: string; svg: string };

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const frame = $<HTMLIFrameElement>("frame");
const log = $<HTMLPreElement>("log");
const say = (line: string) => { log.textContent = `${line}\n${log.textContent}`; };

let drawing = SAMPLE;
let documentNo = 1;
let theme: "light" | "dark" = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
let displayMode: "inline" | "fullscreen" = "inline";

const context = () => ({ theme, displayMode, availableDisplayModes: ["inline" as const, "fullscreen" as const] });
const bridge = new AppBridge(
  null,
  { name: "Widget preview host", version: "1.0.0" },
  { openLinks: {}, serverTools: {} },
  { hostContext: context() },
);

bridge.oncalltool = async (params) => {
  say(`tools/call ${params.name} ${JSON.stringify(params.arguments)}`);
  if (params.name !== "get_document_svg") return { content: [{ type: "text", text: `No tool ${params.name} here.` }], isError: true };
  return {
    content: [{ type: "text", text: "The markup, for the preview." }],
    structuredContent: { svg: drawing.svg, title: drawing.title, link: `https://editsvgcode.com/doc${documentNo}` },
  };
};
bridge.onopenlink = async ({ url }) => {
  say(`open link ${url}`);
  return {};
};
bridge.onrequestdisplaymode = async ({ mode }) => {
  displayMode = mode === "fullscreen" ? "fullscreen" : "inline";
  document.body.classList.toggle("fullscreen", displayMode === "fullscreen");
  bridge.setHostContext(context());
  say(`display mode ${displayMode}`);
  return { mode: displayMode };
};
bridge.onsizechange = ({ height }) => {
  if (height !== undefined) frame.style.height = `${height}px`;
};

/** As a host does after show_document: the tool's result, which names the document. */
function showDocument(): void {
  bridge.sendToolResult({
    content: [{ type: "text", text: "Showing the drawing to the user." }],
    structuredContent: { documentId: `doc${documentNo}` },
  });
  say(`tool result: show_document doc${documentNo}`);
}

bridge.oninitialized = () => {
  say("widget initialized");
  showDocument();
};

// The bridge listens before the page loads: the widget says hello as soon as its script runs.
await bridge.connect(new PostMessageTransport(frame.contentWindow!, frame.contentWindow!));
frame.srcdoc = WIDGET_HTML;

$("theme").textContent = `Theme: ${theme}`;
$("theme").onclick = () => {
  theme = theme === "dark" ? "light" : "dark";
  document.body.dataset.theme = theme;
  $("theme").textContent = `Theme: ${theme}`;
  bridge.setHostContext(context());
};
document.body.dataset.theme = theme;

$<HTMLSelectElement>("width").onchange = (e) => {
  $("chat").style.width = (e.target as HTMLSelectElement).value;
};

// Another drawing: as if the model opened a different document and showed it.
$<HTMLInputElement>("file").onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  drawing = { title: file.name.replace(/\.svg$/i, ""), svg: await file.text() };
  documentNo++;
  showDocument();
};
$("edit").onclick = () => {
  // A stand-in for an edit the model made: the widget sees it on Refresh.
  drawing = { ...drawing, svg: drawing.svg.replace(/<svg\b([^>]*)>/i, '<svg$1><g opacity="0.35">').replace(/<\/svg>\s*$/i, "</g></svg>") };
  say("drawing changed on the server (press Refresh in the widget)");
};

import { AppBridge, PostMessageTransport } from "@modelcontextprotocol/ext-apps/app-bridge";

/**
 * A stand-in for a chat host (Claude, ChatGPT), to look at the MCP widget without deploying:
 * scripts/widget-preview.mjs bundles this into lib/widget-preview.html next to the widget page.
 * It loads the widget into a sandboxed iframe as hosts do, hands it a show_document result and
 * answers its get_document_svg call with the drawing chosen here instead of a stored document.
 * With ?page=picture it loads the picture widget instead and hands it a generate_image result;
 * picture_link answers with a PNG painted here from the sample drawing, not the image model.
 * With ?page=modify it hands the picture widget a modify_image result for the sample drawing;
 * a change POSTs the drawing's PNG, so give ?picture=<url> of a server that answers with a PNG
 * (dev/picture-echo.mjs sends the same picture back).
 */

declare const WIDGET_HTML: string;
declare const PICTURE_HTML: string;
declare const SAMPLE: { title: string; svg: string };

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const frame = $<HTMLIFrameElement>("frame");
const log = $<HTMLPreElement>("log");
const say = (line: string) => { log.textContent = `${line}\n${log.textContent}`; };

let drawing = SAMPLE;
let documentNo = 1;
let theme: "light" | "dark" = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
let displayMode: "inline" | "fullscreen" = "inline";
const query = new URLSearchParams(location.search);
const page = query.get("page") === "picture" || query.get("page") === "modify" ? "picture" : "preview";
const modify = query.get("page") === "modify";

/** The sample drawing painted into a PNG, standing in for what the image model would return. */
async function samplePng(): Promise<string> {
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SAMPLE.svg)}`;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  canvas.getContext("2d")!.drawImage(img, 0, 0, 1024, 1024);
  return canvas.toDataURL("image/png");
}

const context = () => ({ theme, displayMode, availableDisplayModes: ["inline" as const, "fullscreen" as const] });
const bridge = new AppBridge(
  null,
  { name: "Widget preview host", version: "1.0.0" },
  { openLinks: {}, serverTools: {}, message: { text: {} }, updateModelContext: { text: {} } },
  { hostContext: context() },
);

bridge.oncalltool = async (params) => {
  say(`tools/call ${params.name} ${JSON.stringify(params.arguments).slice(0, 120)}`);
  if (params.name === "create_document") {
    const args = params.arguments as { svg: string; title: string };
    drawing = { title: args.title, svg: args.svg };
    documentNo++;
    return { content: [{ type: "text", text: `Document doc${documentNo}` }], structuredContent: { documentId: `doc${documentNo}` } };
  }
  if (params.name === "picture_link") {
    const url = (params.arguments as { kind?: string }).kind === "modify" ? query.get("picture") ?? "" : await samplePng();
    return { content: [{ type: "text", text: "A one-time link." }], structuredContent: { url } };
  }
  if (params.name === "replace_svg") {
    drawing = { ...drawing, svg: (params.arguments as { svg: string }).svg };
    return { content: [{ type: "text", text: "Saved." }] };
  }
  if (params.name !== "get_document_svg") return { content: [{ type: "text", text: `No tool ${params.name} here.` }], isError: true };
  return {
    content: [{ type: "text", text: "The markup, for the preview." }],
    structuredContent: { svg: drawing.svg, title: drawing.title, link: `https://editsvgcode.com/doc${documentNo}` },
  };
};
bridge.onmessage = async ({ content }) => {
  say(`message to the model: ${content.map((c) => (c.type === "text" ? c.text : c.type)).join(" ")}`);
  return {};
};
bridge.onupdatemodelcontext = async ({ content }) => {
  say(`model context: ${(content ?? []).map((c) => (c.type === "text" ? c.text : c.type)).join(" ")}`);
  return {};
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
  if (page === "picture") {
    bridge.sendToolResult({
      content: [{ type: "text", text: "A card in the chat now shows this picture." }],
      structuredContent: modify
        ? { mode: "modify", documentId: `doc${documentNo}`, prompt: "Add a small party hat", model: "gpt-image-1-mini", credits: 10, editorUrl: "https://editsvgcode.com" }
        : { prompt: "A tiger's head, front view, bold flat colours", model: "gpt-image-1-mini", credits: 10, editorUrl: "https://editsvgcode.com" },
    });
    say(modify ? "tool result: modify_image" : "tool result: generate_image");
  } else {
    showDocument();
  }
};

// The bridge listens before the page loads: the widget says hello as soon as its script runs.
await bridge.connect(new PostMessageTransport(frame.contentWindow!, frame.contentWindow!));
frame.srcdoc = page === "picture" ? PICTURE_HTML : WIDGET_HTML;

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
$("upload").onclick = () => {
  const documents = [
    { id: `doc${documentNo}`, title: drawing.title, modified: new Date().toISOString() },
    { id: "doc0", title: "An older drawing", modified: new Date(Date.now() - 86_400_000).toISOString() },
  ];
  bridge.sendToolResult({ content: [{ type: "text", text: "A picker is shown." }], structuredContent: { documents } });
  say("tool result: list_documents");
};
$("edit").onclick = () => {
  // A stand-in for an edit the model made: the widget sees it on Refresh.
  drawing = { ...drawing, svg: drawing.svg.replace(/<svg\b([^>]*)>/i, '<svg$1><g opacity="0.35">').replace(/<\/svg>\s*$/i, "</g></svg>") };
  say("drawing changed on the server (press Refresh in the widget)");
};

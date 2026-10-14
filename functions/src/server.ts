import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema, GetPromptRequestSchema, ListPromptsRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema,
  ReadResourceRequestSchema, type CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import { buildSvgContext } from "../../src/lib/svg-ai";
import { installDom } from "./dom";
import { applyEditTool, runReadTool, svgBytes, EDIT_TOOLS, MAX_SVG_BYTES, READ_TOOLS } from "./edits";
import type { DocumentStore, StoredDocument } from "./documents";
import { getPrompt, PROMPTS } from "./prompts";
import { TOOLS } from "./tools";
import { readWidgetHtml, WIDGET_META, WIDGET_MIME_TYPE, WIDGET_URI } from "./widget";

export interface McpContext {
  uid: string;
  store: DocumentStore;
  /** Where a document opens in the editor, without the trailing slash. */
  editorUrl: string;
  /** The widget page (lib/widget.html). Tests pass their own. */
  widgetHtml?: () => Promise<string>;
}

const INSTRUCTIONS = `editsvgcode edits SVG drawings that live in the user's editsvgcode.com account.
Start with create_document (a new drawing) or open_document (an existing one, by id or editor link); both return the document as numbered lines and the editor link.
The user sees the drawing only when you call show_document: call it once the drawing is created or opened, and again when a round of edits is done (not after every edit call).
When the user attaches an SVG file or wants to give you one, call upload_document rather than copying the file into create_document.
Prefer the structural tools (set_attribute, set_text, set_style_rule, insert_element, remove_element) over replace_lines, and replace_lines over replace_svg: they change only what they address, so coordinates and formatting survive. Use query to find out what an address matches before editing many elements.
Every edit is saved immediately. Line numbers refer to the document as it is NOW; after an edit that adds or removes lines, re-read before using line numbers again.`;

function text(t: string, isError = false): CallToolResult {
  return { content: [{ type: "text", text: t }], ...(isError ? { isError: true } : {}) };
}

/**
 * A bare id, or an editor link whose first path segment is one (as the editor's getUniqueId reads
 * it): https://editsvgcode.com/abc123?x=1. Null for anything that cannot be a document id, so odd
 * input is answered as "no such document" instead of reaching Firestore as an invalid path.
 * Wider than the editor's isCleanId on purpose: older documents carry ids it would re-mint.
 */
export function documentIdOf(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  let id = s;
  if (/^https?:\/\//i.test(s)) {
    try {
      id = new URL(s).pathname.split("/")[1] ?? "";
    } catch {
      return null;
    }
  }
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id) || /^__.*__$/.test(id)) return null;
  return id;
}

function canRead(doc: StoredDocument, uid: string): boolean {
  return doc.uid === uid || doc.visibility !== "private";
}

/** As firestore.rules: the owner, or anyone signed in for a legacy file that has no owner. */
function canEdit(doc: StoredDocument, uid: string): boolean {
  return doc.uid === uid || doc.uid === null;
}

function describe(doc: StoredDocument, ctx: McpContext): string {
  const owner = doc.uid === ctx.uid
    ? `yours, ${doc.visibility}`
    : doc.uid === null
      ? `no owner, ${doc.visibility} — anyone signed in can edit it`
      : "someone else's — read only; create_document a copy to change it";
  const title = doc.title ? ` "${doc.title}"` : "";
  return `Document ${doc.id}${title} (${owner}). Editor: ${ctx.editorUrl}/${doc.id}`;
}

export async function callTool(name: string, args: Record<string, unknown>, ctx: McpContext): Promise<CallToolResult> {
  await installDom();

  if (name === "create_document") {
    const svg = String(args.svg ?? "");
    if (!svg.trim()) return text("Give the SVG markup to start from in \"svg\".", true);
    const bytes = svgBytes(svg);
    if (bytes > MAX_SVG_BYTES) return text(`The SVG is ${bytes} bytes, over the ${MAX_SVG_BYTES}-byte limit.`, true);
    const title = String(args.title ?? "").slice(0, 200);
    const id = await ctx.store.create(ctx.uid, svg, title);
    const doc: StoredDocument = { id, text: svg, uid: ctx.uid, visibility: "private", title };
    return { ...text(`${describe(doc, ctx)}\n\n${buildSvgContext(svg)}`), structuredContent: { documentId: id } };
  }

  // The widget takes the file and saves it with create_document, then says so in the chat.
  // Both show the picker (the widget): the user's drawings to click, and a box to drop a file
  // into. list_documents is the tool a model finds when it looks for "files" — claude.ai loads
  // connector tools by search — so the picker turns up even when upload_document is never seen.
  if (name === "list_documents" || name === "upload_document") {
    const limit = Math.min(100, Math.max(1, Number(args.limit) || 20));
    const docs = await ctx.store.listOwned(ctx.uid, limit);
    const picker = "Where the chat shows widgets, a picker is now shown: the user can pick one of these drawings or upload an SVG file from their computer, and a note then names the document. You cannot read files attached to the chat, so do not ask for an attachment or pasted code — ask the user to upload the file in the picker.";
    const rows = docs.map((d) =>
      `- ${d.id}  ${d.title ? JSON.stringify(d.title) : "(untitled)"}  ${d.visibility}`
      + `${d.modified ? `, changed ${d.modified.toISOString()}` : ""}  ${ctx.editorUrl}/${d.id}`);
    const list = docs.length === 0 ? "You have no saved drawings yet. create_document starts one." : rows.join("\n");
    return {
      ...text(`${list}\n\n${picker}`),
      structuredContent: { documents: docs.map((d) => ({ id: d.id, title: d.title, modified: d.modified?.toISOString() ?? null })) },
    };
  }

  const id = documentIdOf(args.document_id);
  if (!id) return text(`"${String(args.document_id ?? "")}" is not a document id or editor link.`, true);
  const isRead = name === "open_document" || name === "show_document" || name === "get_document_svg"
    || (READ_TOOLS as readonly string[]).includes(name);
  const isEdit = (EDIT_TOOLS as readonly string[]).includes(name);
  if (!isRead && !isEdit) return text(`Unknown tool "${name}".`, true);

  // A private document of someone else's is reported as missing, as the editor does.
  const missing = `There is no document "${id}" you can open.`;

  if (isRead) {
    const doc = await ctx.store.get(id);
    if (!doc || !canRead(doc, ctx.uid)) return text(missing, true);
    if (name === "open_document") return text(`${describe(doc, ctx)}\n\n${buildSvgContext(doc.text)}`);
    // The widget is handed only the id, and fetches the markup itself through get_document_svg.
    if (name === "show_document") {
      return { ...text(`Showing the drawing to the user. ${describe(doc, ctx)}`), structuredContent: { documentId: doc.id } };
    }
    if (name === "get_document_svg") {
      return {
        ...text(`The markup of document ${doc.id}, for the preview.`),
        structuredContent: { svg: doc.text, title: doc.title, link: `${ctx.editorUrl}/${doc.id}` },
      };
    }
    return text(runReadTool(name, args, doc.text));
  }

  // Access is decided on the snapshot the transaction writes over, not on an earlier read.
  let message = missing;
  let written = false;
  await ctx.store.update(id, (current) => {
    if (!canRead(current, ctx.uid)) return null;
    if (!canEdit(current, ctx.uid)) {
      message = `Document ${id} belongs to someone else, so it cannot be changed. create_document a copy of it to edit.`;
      return null;
    }
    const result = applyEditTool(name, args, current.text);
    message = result.message;
    written = result.text !== null;
    return result.text;
  });
  return text(message, !written);
}

/** One server per request: the endpoint is stateless, and each request carries its own user. */
export function createMcpServer(ctx: McpContext): Server {
  const server = new Server(
    { name: "editsvgcode", title: "EditSvgCode", version: "1.0.0", websiteUrl: "https://editsvgcode.com" },
    { capabilities: { tools: {}, resources: {}, prompts: {} }, instructions: INSTRUCTIONS },
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: PROMPTS }));
  server.setRequestHandler(GetPromptRequestSchema, async (req) => {
    const prompt = getPrompt(req.params.name);
    if (!prompt) throw new Error(`Unknown prompt ${req.params.name}`);
    return prompt;
  });
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [{ uri: WIDGET_URI, name: "Drawing preview", mimeType: WIDGET_MIME_TYPE, _meta: WIDGET_META }],
  }));
  server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
    if (req.params.uri !== WIDGET_URI) throw new Error(`Unknown resource ${req.params.uri}`);
    const html = await (ctx.widgetHtml ?? readWidgetHtml)();
    return { contents: [{ uri: WIDGET_URI, mimeType: WIDGET_MIME_TYPE, text: html, _meta: WIDGET_META }] };
  });
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const args = (req.params.arguments ?? {}) as Record<string, unknown>;
    let result: CallToolResult;
    try {
      result = await callTool(req.params.name, args, ctx);
    } catch (err) {
      result = text(`Error: ${err instanceof Error ? err.message : String(err)}`, true);
    }
    // Which tools a client's model reaches for, and how much it writes: no content, no user.
    console.log(`mcp tool ${req.params.name}: ${JSON.stringify(args).length} chars in${result.isError ? ", refused" : ""}`);
    return result;
  });
  return server;
}

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { buildSvgContext } from "../../src/lib/svg-ai";
import { installDom } from "./dom";
import { applyEditTool, runReadTool, svgBytes, EDIT_TOOLS, MAX_SVG_BYTES, READ_TOOLS } from "./edits";
import type { DocumentStore, StoredDocument } from "./documents";
import { TOOLS } from "./tools";

export interface McpContext {
  uid: string;
  store: DocumentStore;
  /** Where a document opens in the editor, without the trailing slash. */
  editorUrl: string;
}

const INSTRUCTIONS = `editsvgcode edits SVG drawings that live in the user's editsvgcode.com account.
Start with create_document (a new drawing) or open_document (an existing one, by id or editor link); both return the document as numbered lines and the editor link — give the user that link so they can watch and fine-tune the drawing.
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
    return text(`${describe(doc, ctx)}\n\n${buildSvgContext(svg)}`);
  }

  if (name === "list_documents") {
    const limit = Math.min(100, Math.max(1, Number(args.limit) || 20));
    const docs = await ctx.store.listOwned(ctx.uid, limit);
    if (docs.length === 0) return text("You have no saved drawings yet. create_document starts one.");
    const rows = docs.map((d) =>
      `- ${d.id}  ${d.title ? JSON.stringify(d.title) : "(untitled)"}  ${d.visibility}`
      + `${d.modified ? `, changed ${d.modified.toISOString()}` : ""}  ${ctx.editorUrl}/${d.id}`);
    return text(rows.join("\n"));
  }

  const id = documentIdOf(args.document_id);
  if (!id) return text(`"${String(args.document_id ?? "")}" is not a document id or editor link.`, true);
  const isRead = name === "open_document" || (READ_TOOLS as readonly string[]).includes(name);
  const isEdit = (EDIT_TOOLS as readonly string[]).includes(name);
  if (!isRead && !isEdit) return text(`Unknown tool "${name}".`, true);

  // A private document of someone else's is reported as missing, as the editor does.
  const missing = `There is no document "${id}" you can open.`;

  if (isRead) {
    const doc = await ctx.store.get(id);
    if (!doc || !canRead(doc, ctx.uid)) return text(missing, true);
    if (name === "open_document") return text(`${describe(doc, ctx)}\n\n${buildSvgContext(doc.text)}`);
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
    { capabilities: { tools: {} }, instructions: INSTRUCTIONS },
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    try {
      return await callTool(req.params.name, (req.params.arguments ?? {}) as Record<string, unknown>, ctx);
    } catch (err) {
      return text(`Error: ${err instanceof Error ? err.message : String(err)}`, true);
    }
  });
  return server;
}

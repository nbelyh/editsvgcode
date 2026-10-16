import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, type CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import { fetchIcon, fetchIcons, formatIconForModel } from "../../src/lib/icon-search";
import { buildSvgContext, CLIP_MARKER } from "../../src/lib/svg-ai";
import { looksTraced, TRACED_NOTE } from "../../src/lib/traced";
import { getElementBounds } from "../../src/lib/svg-bounds";
import { renderSnapshot, type SnapshotOptions } from "../../src/lib/svg-snapshot";
import { installDom } from "./dom";
import { applyEditTool, runReadTool, svgBytes, EDIT_TOOLS, MAX_SVG_BYTES, READ_TOOLS } from "./edits";
import { newDocumentId, type DocumentStore, type StoredDocument } from "./documents";
import { DEFAULT_IMAGE_MODEL, HOLD_MS, IMAGE_MODELS, issueTicket, type TicketStore } from "./pictures";
import { EXPORT_TTL_MS, fileName, issueExport, PNG_SIZES, type ExportFormat, type ExportStore } from "./exports";
import { iconSheet, measureWithResvg, resvgBackend } from "./render";
import { TOOLS } from "./tools";
import { readWidgetHtml, WIDGET_MIME_TYPE, WIDGET_PAGES, widgetMeta } from "./widget";

export interface McpContext {
  uid: string;
  store: DocumentStore;
  /** Where a document opens in the editor, without the trailing slash. */
  editorUrl: string;
  /** A widget page, by its file under lib/. Tests pass their own. */
  widgetHtml?: (file: string) => Promise<string>;
  /** Pictures: where the picture widget fetches one (…/picture, see pictures.ts), and the
   *  one-time tickets behind those links. Unset, generate_image says pictures are unavailable. */
  pictures?: { url: string; tickets: TicketStore };
  /** Download links (exports.ts): where they point, without the token, and the tickets behind
   *  them. Unset, export_document says downloads are unavailable. */
  exports?: { url: string; store: ExportStore };
}

const INSTRUCTIONS = `editsvgcode edits SVG drawings that live in the user's editsvgcode.com account.
Start with create_document (a new drawing) or open_document (an existing one, by id or editor link); both return the document as numbered lines and the editor link.
The user sees the drawing only when you call show_document: call it once the drawing is created or opened, and again when a round of edits is done (not after every edit call).
When the user attaches an SVG file or wants to give you one, call upload_document rather than copying the file into create_document.
When the user asks to generate an image or picture, or wants an illustration, a character, an animal, a scene — anything better painted than drawn with a few shapes — call generate_image, even when they say SVG: the picture is traced into SVG. It puts a card in the chat where the user sees the price and decides; do not avoid it to save their credits. Draw icons and simple shapes yourself, or when the user asks for hand-made shapes.
To change such a picture — add or remove a detail, change a pose, an expression, the style — call modify_image with its document id, rather than generating a new one: the image model redraws it from the drawing as it is. Recolouring and small changes to shapes are better done with the edit tools, which cost nothing.
Prefer the structural tools (set_attribute, set_text, set_style_rule, insert_element, remove_element) over replace_lines, and replace_lines over replace_svg: they change only what they address, so coordinates and formatting survive. Use query to find out what an address matches before editing many elements.
You do not see what show_document shows the user. To see the drawing yourself, call get_png_image: before recolouring or removing part of a traced picture, highlight the candidate paths to find which one is the part meant, and look again to check the result.
To change a drawing while keeping the original, or one someone else shared, copy_document it first and edit the copy.
For a recognizable object or symbol, search_icons finds an open-source icon to insert instead of drawing one.
When a change to a generated or traced picture is too complex to make well with the edit tools — something to add, remove or reshape, a pose, an expression, a part with no shape of its own — use modify_image rather than drawing paths by hand: it redraws the picture from the drawing as it is.
Every edit is saved immediately. Line numbers refer to the document as it is NOW; after an edit that adds or removes lines, re-read before using line numbers again.`;

function text(t: string, isError = false): CallToolResult {
  return { content: [{ type: "text", text: t }], ...(isError ? { isError: true } : {}) };
}

/**
 * A result with structured content (for the widgets), carrying its text in it too, as
 * `message`: a client may hand the model only the structured content when there is any (Claude
 * Code does), and the model then missed the text — the editor link, the document's lines.
 */
function withData(t: string, data: Record<string, unknown>): CallToolResult {
  return { ...text(t), structuredContent: { ...data, message: t } };
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

/**
 * A picture card's drawing id, as generate_image and modify_image pick it (newDocumentId:
 * lowercase base36) before the drawing exists. The widget saves the picture under it, so a
 * widget the chat rebuilt finds the drawing there and shows it instead of asking again.
 */
function targetIdOf(raw: unknown): string | null {
  const id = String(raw ?? "");
  return /^[0-9a-z]{10,40}$/.test(id) ? id : null;
}

/** The picker asks for the rows it shows, a page at a time (src/mcp-widget/main.tsx). */
const MAX_THUMBNAILS = 20;
const MAX_THUMBNAIL_BYTES = 200_000;

function canRead(doc: StoredDocument, uid: string): boolean {
  return doc.uid === uid || doc.visibility !== "private";
}

/** As firestore.rules: the owner, or anyone signed in for a legacy file that has no owner. */
function canEdit(doc: StoredDocument, uid: string): boolean {
  return doc.uid === uid || doc.uid === null;
}

/** Up to this size a drawing just made is shown back whole, numbered; beyond it, as an outline. */
const ECHO_CHARS = 4000;
/** An outline's lines are cut here, marked as clipped lines are, so none is copied back as whole. */
const OUTLINE_LINE_CHARS = 160;
const OUTLINE_LINES = 300;

/**
 * A drawing the model has just written, or copied: its numbered lines, to address them by, but
 * not all of it again. Sending a 20 KB traced picture back right after it was sent doubled the
 * cost of every create.
 */
function outline(svg: string): string {
  const source = normalized(svg);
  if (source.length <= ECHO_CHARS) return buildSvgContext(source);
  const lines = source.split("\n");
  const clip = (line: string) => line.length <= OUTLINE_LINE_CHARS ? line
    : `${line.slice(0, OUTLINE_LINE_CHARS)} [... ${line.length - OUTLINE_LINE_CHARS} ${CLIP_MARKER} ...]`;
  const numbered = (from: number, list: string[]) => list.map((l, i) => `${from + i}: ${clip(l)}`);
  const shown = lines.length <= OUTLINE_LINES ? numbered(1, lines)
    : [...numbered(1, lines.slice(0, OUTLINE_LINES - 50)),
      `[... lines ${OUTLINE_LINES - 49}–${lines.length - 50} not shown ...]`,
      ...numbered(lines.length - 49, lines.slice(-50))];
  const kb = Math.round(source.length / 1024);
  return `SVG document (${lines.length} lines, ${kb} KB), as an outline: long lines are clipped; read_svg_lines returns any line in full.\n\`\`\`\n${shown.join("\n")}\n\`\`\``;
}

/** Said of a traced drawing when it is opened, as the editor says it each turn (traced.ts). */
function tracedNote(svg: string): string {
  return looksTraced(svg) ? `\n${TRACED_NOTE}` : "";
}

/** The text every address is read against, as the editor reads it (api-client.ts normalizedSvg). */
function normalized(svg: string): string {
  return svg.replace(/\r\n/g, "\n");
}

const STYLES = ["outline", "filled", "any"] as const;
const PALETTES = ["colored", "monochrome", "any"] as const;
function oneOf<T extends string>(list: readonly T[], value: unknown, fallback: T): T {
  return list.includes(value as T) ? (value as T) : fallback;
}
/** Icons shown from one search: a sheet of 4 × 3 still reads at a glance. */
const MAX_ICONS = 12;

function describe(doc: StoredDocument, ctx: McpContext): string {
  const owner = doc.uid === ctx.uid
    ? `yours, ${doc.visibility}`
    : doc.uid === null
      ? `no owner, ${doc.visibility} — anyone signed in can edit it`
      : "someone else's — read only; copy_document it to change a copy";
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
    return withData(`${describe(doc, ctx)}\n\n${outline(svg)}`, { documentId: id });
  }

  // A link to the file itself (exports.ts), for the user or another program: the model never
  // types the drawing out to hand it over.
  if (name === "export_document") {
    if (!ctx.exports) return text("Downloads are not available on this server.", true);
    const id = documentIdOf(args.document_id);
    const doc = id ? await ctx.store.get(id) : null;
    if (!doc || !canRead(doc, ctx.uid)) return text(`There is no document "${String(args.document_id ?? "")}" you can open.`, true);
    const format: ExportFormat = args.format === "png" ? "png" : "svg";
    const asked = args.size === undefined || args.size === null || args.size === "" ? NaN : Number(args.size);
    const size = Number.isFinite(asked) ? Math.round(Math.min(PNG_SIZES.max, Math.max(PNG_SIZES.min, asked))) : PNG_SIZES.default;
    const token = await issueExport(ctx.exports.store, { uid: ctx.uid, documentId: doc.id, format, size });
    const url = `${ctx.exports.url}/${token}`;
    const what = format === "svg" ? "the SVG file" : `a PNG ${size} pixels on its longest side`;
    const name = fileName(doc.title, doc.id, format);
    return withData(`Download link for ${what} of document ${doc.id}, saved as ${name}: ${url}\nIt works without signing in and lasts ${EXPORT_TTL_MS / 60_000} minutes, serving the drawing as it is when fetched. Give it to the user as a link, or fetch it: curl -L -o ${name} "${url}"`, { url, format, fileName: name });
  }

  // On the server, so a large drawing is never re-typed, and a shared one can be changed as a copy.
  if (name === "copy_document") {
    const id = documentIdOf(args.document_id);
    const doc = id ? await ctx.store.get(id) : null;
    if (!doc || !canRead(doc, ctx.uid)) return text(`There is no document "${String(args.document_id ?? "")}" you can open.`, true);
    const title = (String(args.title ?? "").trim() || (doc.title ? `${doc.title} (copy)` : "Copy")).slice(0, 200);
    const copyId = await ctx.store.create(ctx.uid, doc.text, title);
    const copy: StoredDocument = { id: copyId, text: doc.text, uid: ctx.uid, visibility: "private", title };
    return withData(`Copied document ${doc.id}; edit the copy. ${describe(copy, ctx)}${tracedNote(doc.text)}\n\n${outline(doc.text)}`, { documentId: copyId });
  }

  // The editor shows a search's icons for the user to click; here the model picks from a sheet
  // of them, and asks for the one it chose by name.
  if (name === "search_icons") {
    if (args.pick !== undefined && String(args.pick).trim()) {
      const icon = await fetchIcon(String(args.pick));
      if ("error" in icon) return text(icon.error, true);
      let into = "";
      if (args.document_id !== undefined) {
        const id = documentIdOf(args.document_id);
        const doc = id ? await ctx.store.get(id) : null;
        if (!doc || !canRead(doc, ctx.uid)) return text(`There is no document "${String(args.document_id)}" you can open.`, true);
        into = normalized(doc.text);
      }
      return text(formatIconForModel(icon, into).replace(/^User selected icon:/, "Icon:"));
    }
    const query = String(args.query ?? "").trim();
    if (!query) return text("Give one or two keywords in \"query\".", true);
    const { icons, error } = await fetchIcons(query, oneOf(STYLES, args.style, "any"), args.noAttribution !== false, oneOf(PALETTES, args.palette, "any"));
    if (error || icons.length === 0) return text(error ?? "No icons found.", true);
    const shown = icons.slice(0, MAX_ICONS);
    const rows = shown.map((icon, i) => `${i + 1}. ${icon.name} — ${icon.setName}, ${icon.license}${icon.needsAttribution ? " (needs attribution)" : ""}`);
    const listing = `${shown.length} icons for "${query}", numbered as in the picture:\n${rows.join("\n")}\n\nCall search_icons again with pick set to the chosen name, and document_id, to get it ready to insert. If none fits, search with another word, or use generate_image for a picture of its own.`;
    let sheet: string | null = null;
    try {
      sheet = iconSheet(shown);
    } catch {
      // The names are still there to pick by.
    }
    return { content: [{ type: "text", text: listing }, ...(sheet ? [{ type: "image" as const, data: sheet, mimeType: "image/png" }] : [])] };
  }

  // Only the card: the user presses Generate on it, and the picture widget does the rest.
  if (name === "generate_image") {
    const prompt = String(args.prompt ?? "").trim();
    if (!prompt) return text("Describe the picture in \"prompt\".", true);
    const model = String(args.model ?? DEFAULT_IMAGE_MODEL);
    const price = IMAGE_MODELS[model];
    if (!price) return text(`Unknown image model "${model}". Use one of: ${Object.keys(IMAGE_MODELS).join(", ")}.`, true);
    if (!ctx.pictures) return text("Pictures are not available on this server.", true);
    // Where no widget shows the card, the editor shows its own (src/lib/open-from-url.ts).
    const editorLink = `${ctx.editorUrl}/?generate=${encodeURIComponent(prompt)}`;
    return withData(`In chats that show widgets, a card now shows this picture and what it costs (${price.credits} credits); nothing is generated or charged until the user presses Generate on it, and the result is traced into an SVG drawing, saved to their account, and named in a note. Where no card appears (the chat shows no widgets), the same card opens in the EditSvgCode editor at ${editorLink}, charged to the same credits; the result stays in the editor.`, { prompt, model, credits: price.credits, editorUrl: ctx.editorUrl, targetId: newDocumentId() });
  }

  // The same card, for a change to a drawing: the widget renders it to a PNG and sends that up.
  if (name === "modify_image") {
    const request = String(args.request ?? "").trim();
    if (!request) return text("Say what to change in \"request\".", true);
    const model = String(args.model ?? DEFAULT_IMAGE_MODEL);
    const price = IMAGE_MODELS[model];
    if (!price) return text(`Unknown image model "${model}". Use one of: ${Object.keys(IMAGE_MODELS).join(", ")}.`, true);
    if (!ctx.pictures) return text("Pictures are not available on this server.", true);
    const id = documentIdOf(args.document_id);
    const doc = id ? await ctx.store.get(id) : null;
    if (!doc || !canRead(doc, ctx.uid)) return text(`There is no document "${String(args.document_id ?? "")}" you can open.`, true);
    const editorLink = `${ctx.editorUrl}/${doc.id}?modify=${encodeURIComponent(request)}`;
    return withData(`In chats that show widgets, a card now shows the drawing, this change and what it costs (${price.credits} credits); nothing is changed or charged until the user presses Change on it, and the result is traced into SVG and saved as a new drawing (document ${doc.id} stays as it is), named in a note. Where no card appears (the chat shows no widgets), the same card opens in the EditSvgCode editor at ${editorLink}, charged to the same credits; the result stays in the editor.`, { mode: "modify", documentId: doc.id, prompt: request, model, credits: price.credits, editorUrl: ctx.editorUrl, targetId: newDocumentId() });
  }

  // For the picture widget alone: a link that makes one picture, once, charged to this user.
  // With the card's target, a card whose picture is saved or still being made gets none.
  if (name === "picture_link") {
    if (!ctx.pictures) return text("Pictures are not available on this server.", true);
    const prompt = String(args.prompt ?? "").trim().slice(0, 4000);
    const model = String(args.model ?? DEFAULT_IMAGE_MODEL);
    if (!prompt || !IMAGE_MODELS[model]) return text("A picture needs a prompt and a known image model.", true);
    const target = args.target_id === undefined ? null : targetIdOf(args.target_id);
    if (args.target_id !== undefined && !target) return text("That is not a picture card's drawing.", true);
    if (target) {
      if (await ctx.store.get(target)) {
        return { ...text("This card's picture was made already.", true), structuredContent: { made: true, documentId: target } };
      }
      const now = Date.now();
      if (!await ctx.pictures.tickets.hold(target, new Date(now + HOLD_MS), new Date(now))) {
        return { ...text("This card's picture is being made already. Wait a minute for it.", true), structuredContent: { busy: true } };
      }
    }
    const token = await issueTicket(ctx.pictures.tickets, {
      uid: ctx.uid, kind: args.kind === "modify" ? "modify" : "generate", prompt, model,
      outlines: args.outlines !== false, detail: args.detail === true,
      ...(target ? { target } : {}),
    });
    return { ...text("A one-time link for the picture."), structuredContent: { url: `${ctx.pictures.url}/${token}` } };
  }

  // For the picture widget alone: the traced picture, saved under the card's drawing id, once.
  if (name === "save_picture") {
    const target = targetIdOf(args.document_id);
    if (!target) return text("That is not a picture card's drawing.", true);
    const svg = String(args.svg ?? "");
    if (!svg.trim()) return text("Give the traced SVG in \"svg\".", true);
    const bytes = svgBytes(svg);
    if (bytes > MAX_SVG_BYTES) return text(`The SVG is ${bytes} bytes, over the ${MAX_SVG_BYTES}-byte limit.`, true);
    const title = String(args.title ?? "").slice(0, 200);
    if (!await ctx.store.createAt(target, ctx.uid, svg, title)) {
      return { ...text(`Document ${target} is saved already.`, true), structuredContent: { made: true, documentId: target } };
    }
    return withData(`Saved as document ${target}. Editor: ${ctx.editorUrl}/${target}`, { documentId: target });
  }

  // For the picker alone: the rows it shows, as small previews. Only the user's own drawings,
  // and none so large that a page of them would weigh megabytes; those keep a blank square.
  if (name === "document_thumbnails") {
    const ids = (Array.isArray(args.document_ids) ? args.document_ids : [])
      .slice(0, MAX_THUMBNAILS).map(documentIdOf).filter((id): id is string => id !== null);
    const docs = await Promise.all(ids.map((id) => ctx.store.get(id)));
    const thumbnails: Record<string, string> = {};
    for (const doc of docs) {
      if (doc && doc.uid === ctx.uid && svgBytes(doc.text) <= MAX_THUMBNAIL_BYTES) thumbnails[doc.id] = doc.text;
    }
    return { ...text(`Previews of ${Object.keys(thumbnails).length} drawings, for the picker.`), structuredContent: { thumbnails } };
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
    return withData(`${list}\n\n${picker}`, { documents: docs.map((d) => ({ id: d.id, title: d.title, modified: d.modified?.toISOString() ?? null })) });
  }

  const id = documentIdOf(args.document_id);
  if (!id) return text(`"${String(args.document_id ?? "")}" is not a document id or editor link.`, true);
  const isRead = name === "open_document" || name === "show_document" || name === "get_document_svg"
    || name === "get_png_image" || name === "get_element_bounds"
    || (READ_TOOLS as readonly string[]).includes(name);
  const isEdit = (EDIT_TOOLS as readonly string[]).includes(name);
  if (!isRead && !isEdit) return text(`Unknown tool "${name}".`, true);

  // A private document of someone else's is reported as missing, as the editor does.
  const missing = `There is no document "${id}" you can open.`;

  if (isRead) {
    const doc = await ctx.store.get(id);
    if (!doc || !canRead(doc, ctx.uid)) return text(missing, true);
    if (name === "open_document") return text(`${describe(doc, ctx)}${tracedNote(doc.text)}\n\n${buildSvgContext(doc.text)}`);
    // The widget is handed only the id, and fetches the markup itself through get_document_svg.
    if (name === "show_document") {
      return withData(`Showing the drawing to the user. ${describe(doc, ctx)}`, { documentId: doc.id, link: `${ctx.editorUrl}/${doc.id}` });
    }
    if (name === "get_document_svg") {
      return {
        ...text(`The markup of document ${doc.id}, for the preview.`),
        structuredContent: { svg: doc.text, title: doc.title, link: `${ctx.editorUrl}/${doc.id}` },
      };
    }
    // The editor's get_png_image and get_element_bounds, drawn and measured by resvg (render.ts).
    if (name === "get_png_image") {
      const shot = await renderSnapshot(normalized(doc.text), args as SnapshotOptions, resvgBackend);
      if (!shot.dataUrl) return text(shot.text, true);
      return {
        content: [
          { type: "text", text: shot.text },
          { type: "image", data: shot.dataUrl.replace(/^data:image\/png;base64,/, ""), mimeType: "image/png" },
        ],
      };
    }
    if (name === "get_element_bounds") {
      return text(getElementBounds(normalized(doc.text), String(args.selector ?? ""), measureWithResvg));
    }
    return text(runReadTool(name, args, doc.text));
  }

  // Access is decided on the snapshot the transaction writes over, not on an earlier read.
  let message = missing;
  let written = false;
  await ctx.store.update(id, (current) => {
    if (!canRead(current, ctx.uid)) return null;
    if (!canEdit(current, ctx.uid)) {
      message = `Document ${id} belongs to someone else, so it cannot be changed. copy_document it, and edit the copy.`;
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
    { capabilities: { tools: {}, resources: {} }, instructions: INSTRUCTIONS },
  );
  const pictureOrigin = ctx.pictures ? new URL(ctx.pictures.url).origin : null;
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: WIDGET_PAGES.map((page) => ({
      uri: page.uri, name: page.name, mimeType: WIDGET_MIME_TYPE, _meta: widgetMeta(page, pictureOrigin),
    })),
  }));
  server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
    const page = WIDGET_PAGES.find((p) => p.uri === req.params.uri);
    if (!page) throw new Error(`Unknown resource ${req.params.uri}`);
    const html = await (ctx.widgetHtml ?? readWidgetHtml)(page.file);
    return { contents: [{ uri: page.uri, mimeType: WIDGET_MIME_TYPE, text: html, _meta: widgetMeta(page, pictureOrigin) }] };
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

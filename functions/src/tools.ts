import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { WIDGET_URI } from "./widget";

const DOCUMENT_ID = {
  type: "string",
  description: "The document's id, as create_document, open_document or list_documents returned it. An editsvgcode.com link to the document also works.",
};

const ADDRESS =
  "Which element(s): a CSS selector (\"#logo\", \"g.legend > text\"), a positional path from query "
  + "(\"/svg[1]/g[2]/rect[1]\"), or \"line N\" for the element whose tag starts on that line. "
  + "A CSS selector may match many elements; all of them are changed.";

/** One tool on a document: `document_id` plus its own fields. */
function onDocument(
  name: string,
  description: string,
  properties: Record<string, object>,
  required: string[],
  annotations: Tool["annotations"],
): Tool {
  return {
    name,
    description,
    inputSchema: {
      type: "object",
      properties: { document_id: DOCUMENT_ID, ...properties },
      required: ["document_id", ...required],
    },
    annotations,
  };
}

/** A structural tool: a list of edits, each addressing elements. */
function edits(itemProperties: Record<string, object>, itemRequired: string[]) {
  return {
    edits: {
      type: "array",
      description: "One entry per change. Send many in one call; each is resolved against the document as it was before this call.",
      items: {
        type: "object",
        properties: { selector: { type: "string", description: ADDRESS }, ...itemProperties },
        required: ["selector", ...itemRequired],
      },
    },
  };
}

const READ = { readOnlyHint: true, openWorldHint: false };
const WRITE = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };
const DESTRUCTIVE = { readOnlyHint: false, destructiveHint: true, openWorldHint: false };

export const TOOLS: Tool[] = [
  {
    name: "create_document",
    description: "Create a new SVG drawing in the user's editsvgcode.com account (private until they share it), from markup you write. Returns its id, its editor link and the document as numbered lines. For a file the user has — attached to the chat or on their computer — use upload_document instead: copying a file here is slow, and fails for a large one.",
    inputSchema: {
      type: "object",
      properties: {
        svg: { type: "string", description: "The complete SVG markup to start from." },
        title: { type: "string", description: "A short title for the drawing." },
      },
      required: ["svg"],
    },
    annotations: { ...WRITE, idempotentHint: false },
  },
  {
    name: "open_document",
    description: "Open a drawing by id or editsvgcode.com link. Returns its editor link and the document as numbered lines — excerpts for a large one; read the rest with read_svg_lines or search_svg.",
    inputSchema: { type: "object", properties: { document_id: DOCUMENT_ID }, required: ["document_id"] },
    annotations: READ,
  },
  {
    name: "upload_document",
    title: "Upload an SVG file",
    description: "Upload an SVG file from the user's computer: shows a picker in the chat with a box to drop the file into (and the user's saved drawings). Use it whenever the user has a file, attached one, or says they will upload one — you cannot read files attached to the chat, and copying one into create_document is slow. The picker saves the file to the user's account and a note then names the new document; open_document it from there. Ask the user to drop the file into the box.",
    inputSchema: { type: "object", properties: {} },
    annotations: READ,
    _meta: { ui: { resourceUri: WIDGET_URI } },
  },
  {
    name: "show_document",
    description: "Show the drawing to the user, rendered, in the chat. Call it after create_document or open_document, and again after each round of edits — once, when the round is done, not after every call. The user cannot see the drawing otherwise.",
    inputSchema: { type: "object", properties: { document_id: DOCUMENT_ID }, required: ["document_id"] },
    annotations: READ,
    _meta: { ui: { resourceUri: WIDGET_URI } },
  },
  {
    name: "get_document_svg",
    description: "The drawing's markup, for the preview in the chat. For the app, not the model.",
    inputSchema: { type: "object", properties: { document_id: DOCUMENT_ID }, required: ["document_id"] },
    annotations: READ,
    _meta: { ui: { visibility: ["app"] } },
  },
  {
    name: "list_documents",
    title: "Your SVG files",
    description: "List the user's SVG files (their saved drawings), most recently changed first, and show them a picker in the chat: they can pick one, or upload an SVG file from their computer into it. Call it when the user wants to work on a file — theirs, saved or on their computer.",
    inputSchema: {
      type: "object",
      properties: { limit: { type: "number", description: "How many to list (default 20, at most 100)." } },
    },
    annotations: READ,
    _meta: { ui: { resourceUri: WIDGET_URI } },
  },

  onDocument("read_svg_lines", "Read lines of the document, numbered. Long lines in the overview are clipped; this returns them whole while the result stays under about 60,000 characters.", {
    start: { type: "number", description: "First line (1-based, inclusive)." },
    end: { type: "number", description: "Last line (inclusive)." },
  }, ["start", "end"], READ),
  onDocument("search_svg", "Find the lines containing some text (case-insensitive), with their line numbers.", {
    query: { type: "string", description: "Text to look for." },
  }, ["query"], READ),
  onDocument("query", "List the elements an address matches: their positional path, tag, id, class, line and own text. Use it to see what is there, and how many elements match, before changing them.", {
    selector: { type: "string", description: ADDRESS },
    limit: { type: "number", description: "Most matches to list (default 200)." },
  }, ["selector"], READ),
  onDocument("list_path_parts", "List the separate shapes inside <path> elements, numbered, with their size and position. A traced drawing keeps every region of one colour in one path; split_path takes these numbers.", {
    selector: { type: "string", description: ADDRESS },
  }, ["selector"], READ),

  onDocument("set_attribute", "Set or remove an attribute on the addressed elements — the way to recolour, resize or move a shape. Only that attribute changes; the rest of the markup is left exactly as it was. Tells you when a <style> rule overrides the attribute, so the change would not show.", edits({
    name: { type: "string", description: "Attribute name, e.g. fill, stroke-width, transform." },
    value: { type: ["string", "null"], description: "The new value, or null to remove the attribute." },
  }, ["name", "value"]), ["edits"], WRITE),
  onDocument("set_text", "Replace the text of the addressed elements — the way to relabel or translate. A multi-line label (several <tspan> lines) takes its lines separated by \\n.", edits({
    text: { type: "string", description: "The new text. An empty string clears it." },
  }, ["text"]), ["edits"], WRITE),
  onDocument("set_style_rule", "Change one declaration in a rule of the document's <style> block, e.g. fill in .cls-1. Use it when the drawing is styled by classes rather than attributes.", edits({
    property: { type: "string", description: "The CSS property, e.g. fill." },
    value: { type: ["string", "null"], description: "The new value, or null to remove the declaration." },
  }, ["property", "value"]), ["edits"], WRITE),
  onDocument("insert_element", "Insert new markup before, after or inside the addressed element, without re-typing anything that is already there.", edits({
    position: { type: "string", enum: ["before", "after", "first-child", "last-child"], description: "Where, relative to the addressed element." },
    svg: { type: "string", description: "The markup to insert — one element or several." },
  }, ["position", "svg"]), ["edits"], WRITE),
  onDocument("remove_element", "Delete the addressed elements and everything inside them.", edits({}, []), ["edits"], DESTRUCTIVE),
  onDocument("split_path", "Replace a <path> with one path per part, as list_path_parts numbers them, optionally giving some parts a new fill — the way to recolour one region of a traced drawing.", edits({
    fills: {
      type: "array",
      description: "New fills for some parts; parts not listed keep the original fill.",
      items: {
        type: "object",
        properties: { part: { type: "number" }, fill: { type: "string" } },
        required: ["part", "fill"],
      },
    },
  }, []), ["edits"], WRITE),
  onDocument("replace_lines", "Replace whole line ranges, by the line numbers the document was shown with. For what has no element to address — a rule in <style>, a document that is not well-formed yet. Every attribute on a replaced line must be written again exactly, so prefer the element tools.", {
    edits: {
      type: "array",
      description: "Ranges to replace; they must not overlap. All refer to the document as it was before this call.",
      items: {
        type: "object",
        properties: {
          start: { type: "number", description: "First line (1-based, inclusive)." },
          end: { type: "number", description: "Last line (inclusive)." },
          content: { type: "string", description: "The new text for these lines. An empty string deletes them." },
        },
        required: ["start", "end", "content"],
      },
    },
  }, ["edits"], DESTRUCTIVE),
  onDocument("replace_svg", "Replace the whole document. Only for starting over or a change to most of it; anything not re-typed is lost.", {
    svg: { type: "string", description: "The complete new SVG markup." },
  }, ["svg"], DESTRUCTIVE),
];

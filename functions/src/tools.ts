import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { DEFAULT_IMAGE_MODEL, IMAGE_MODELS } from "./pictures";
import { PICTURE_WIDGET_URI, WIDGET_URI } from "./widget";

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
  title: string,
  description: string,
  properties: Record<string, object>,
  required: string[],
  annotations: Tool["annotations"],
): Tool {
  return {
    name,
    title,
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
      description: "One entry per change; many can go in one call, each resolved against the document as it was before this call.",
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
    title: "Create a drawing",
    description: "Create a new SVG drawing in the user's editsvgcode.com account (private until they share it), from the given markup. Returns its id, its editor link and the document as numbered lines. A file the user already has, attached to the chat or on their computer, goes in through upload_document: copying a file into this markup is slow, and fails for a large one.",
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
    title: "Open a drawing",
    description: "Open a drawing by id or editsvgcode.com link. Returns its editor link and the document as numbered lines — excerpts for a large one; read the rest with read_svg_lines or search_svg.",
    inputSchema: { type: "object", properties: { document_id: DOCUMENT_ID }, required: ["document_id"] },
    annotations: READ,
  },
  {
    name: "copy_document",
    title: "Copy a drawing",
    description: "Copy a drawing into a new one of the user's own, private, and return its id and editor link. For editing while keeping the original as it is, and for changing a drawing someone else shared, which cannot be edited itself. The copy is made on the server: nothing is re-typed, however large the drawing.",
    inputSchema: {
      type: "object",
      properties: {
        document_id: DOCUMENT_ID,
        title: { type: "string", description: "A title for the copy. Without one it is the original's title with \"(copy)\" after it." },
      },
      required: ["document_id"],
    },
    annotations: { ...WRITE, idempotentHint: false },
  },
  {
    name: "export_document",
    title: "Download a drawing",
    description: "A download link for a drawing, as an SVG file or a PNG picture, for the user to click or for another program to fetch (in a terminal, curl -L -o file.svg <link>). The tools give you the drawing to read; this gives the file itself, so nothing has to be typed out again. The link works without signing in and lasts 15 minutes, and always serves the drawing as it is then. Text in a PNG is set in a standard font; for the drawing's own fonts, export from the editor.",
    inputSchema: {
      type: "object",
      properties: {
        document_id: DOCUMENT_ID,
        format: { type: "string", enum: ["svg", "png"], description: "svg for the file as saved, png for a picture of it." },
        size: { type: "number", description: "For png: the longest side in pixels, 16 to 4096. 1024 unless the user asks." },
      },
      required: ["document_id", "format"],
    },
    annotations: READ,
  },
  {
    name: "upload_document",
    title: "Upload an SVG file",
    description: "Upload an SVG file from the user's computer: shows a picker in the chat with a box to drop the file into, and the user's saved drawings. It is the way in for a file the user has, has attached or is about to upload: files attached to the chat do not reach this server, and copying one into create_document is slow. The user drops the file into the box; the picker saves it to their account, and a note then names the new document for open_document.",
    inputSchema: { type: "object", properties: {} },
    annotations: READ,
    _meta: { ui: { resourceUri: WIDGET_URI } },
  },
  {
    name: "generate_image",
    title: "Generate a picture",
    description: "Generate an image or picture with an image model, traced into an editable SVG drawing. It suits a request to generate an image or a picture, and illustrations, characters, animals, scenes, detailed logos — anything better painted than drawn with a few shapes; the result is an SVG either way. Icons, simple shapes and shapes the user wants hand-made are drawn as markup with create_document instead. Shows a card in the chat with the prompt and its price in the user's EditSvgCode credits; nothing is made or charged until the user presses Generate there, so whether to spend is the user's decision, made on the card. The result is saved as a new drawing in their account, and a note then names it.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "What to picture, in the user's own words: the subject, and a style or colours only if they gave one, with no other features, colours, pose or background added. The user sees the prompt on the card and can add to it there." },
        model: {
          type: "string",
          enum: Object.keys(IMAGE_MODELS),
          description: `The image model. ${DEFAULT_IMAGE_MODEL} (${IMAGE_MODELS[DEFAULT_IMAGE_MODEL].credits} credits) unless the user asks for another; the others need EditSvgCode Pro.`,
        },
      },
      required: ["prompt"],
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    _meta: { ui: { resourceUri: PICTURE_WIDGET_URI } },
  },
  {
    name: "modify_image",
    title: "Change a picture",
    description: "Change a picture-like drawing with the image model — one generate_image made, or any traced or detailed drawing: add or remove a detail, change a pose, an expression, the style. The image model redraws it from the drawing as it is, and the result is traced into SVG and saved as a new drawing; the original stays. It keeps the picture the user has, where generate_image would start a different one. Shows a card in the chat with the drawing, the change and its price in credits; nothing is changed or charged until the user presses Change, so whether to spend is the user's decision. Recolouring and small changes to shapes cost nothing with the edit tools (set_attribute, split_path).",
    inputSchema: {
      type: "object",
      properties: {
        document_id: DOCUMENT_ID,
        request: { type: "string", description: "The change, in the user's own words: what to add, remove or alter, with nothing else added." },
        model: {
          type: "string",
          enum: Object.keys(IMAGE_MODELS),
          description: `The image model. ${DEFAULT_IMAGE_MODEL} (${IMAGE_MODELS[DEFAULT_IMAGE_MODEL].credits} credits) unless the user asks for another; the others need EditSvgCode Pro and keep faces and fine detail better.`,
        },
      },
      required: ["document_id", "request"],
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    _meta: { ui: { resourceUri: PICTURE_WIDGET_URI } },
  },
  {
    name: "picture_link",
    title: "Make the card's picture",
    description: "A one-time link that makes the picture, charged to the user. Called by the picture card in the chat; hidden from the model.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["generate", "modify"] },
        prompt: { type: "string" },
        model: { type: "string" },
        outlines: { type: "boolean" },
        detail: { type: "boolean" },
        target_id: { type: "string", description: "The card's drawing id, from the card's result." },
      },
      required: ["prompt", "model"],
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    _meta: { ui: { visibility: ["app"] } },
  },
  {
    name: "save_picture",
    title: "Save the card's picture",
    description: "Save a traced picture as the card's drawing, once. Called by the picture card in the chat; hidden from the model.",
    inputSchema: {
      type: "object",
      properties: {
        document_id: { type: "string", description: "The card's drawing id, from the card's result." },
        svg: { type: "string" },
        title: { type: "string" },
      },
      required: ["document_id", "svg"],
    },
    annotations: { ...WRITE, idempotentHint: false },
    _meta: { ui: { visibility: ["app"] } },
  },
  {
    name: "search_icons",
    title: "Find an icon",
    description: "Search a library of 200K+ open-source SVG icons by keyword. Returns up to 12 matches, numbered, with their names and licences, and a picture of them side by side to choose from. Then call it again with pick set to the chosen icon's name (and document_id) to get that icon ready to insert into the drawing as its own <svg> tag, with its box worked out. For a recognizable object, symbol or brand logo added to a drawing, or as the whole drawing. Not for scattering simple shapes such as stars or dots: draw those yourself with insert_element.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "One or two simple English keywords, e.g. 'car', 'pencil', 'home': the most common everyday word, not the user's sentence." },
        style: { type: "string", enum: ["outline", "filled", "any"], description: "'outline' for line icons, 'filled' for solid ones, 'any' if unclear." },
        palette: { type: "string", enum: ["colored", "monochrome", "any"], description: "'colored' for multicolour, emoji-style icons; 'monochrome' for one colour that can be recoloured; 'any' if unclear." },
        noAttribution: { type: "boolean", description: "Only icons whose licence needs no attribution (MIT, Apache-2.0…). True unless the user says attribution is fine." },
        pick: { type: "string", description: "The name of the icon chosen from an earlier search, e.g. tabler:home: returns it ready to insert instead of searching." },
        document_id: { ...DOCUMENT_ID, description: `With pick: the drawing it goes into, so its box is worked out in that drawing's units. ${DOCUMENT_ID.description}` },
      },
      required: ["query"],
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  {
    name: "show_document",
    title: "Show the drawing",
    description: "Show the drawing to the user, rendered, in the chat — the only way they see it. Each call adds a preview to the chat, so one after create_document or open_document and one when a round of edits is done is enough; one after every edit call floods the chat. You do not see this preview; get_png_image shows you the drawing.",
    inputSchema: { type: "object", properties: { document_id: DOCUMENT_ID }, required: ["document_id"] },
    annotations: READ,
    _meta: { ui: { resourceUri: WIDGET_URI } },
  },
  {
    name: "get_document_svg",
    title: "Drawing for the preview",
    description: "The drawing's markup, for the preview in the chat. Called by the preview; hidden from the model.",
    inputSchema: { type: "object", properties: { document_id: DOCUMENT_ID }, required: ["document_id"] },
    annotations: READ,
    _meta: { ui: { visibility: ["app"] } },
  },
  {
    name: "document_thumbnails",
    title: "Drawings for the picker",
    description: "The markup of some of the user's drawings, for the small previews in the picker. Called by the picker; hidden from the model.",
    inputSchema: {
      type: "object",
      properties: { document_ids: { type: "array", items: { type: "string" } } },
      required: ["document_ids"],
    },
    annotations: READ,
    _meta: { ui: { visibility: ["app"] } },
  },
  {
    name: "list_documents",
    title: "Your SVG files",
    description: "List the user's SVG files (their saved drawings), most recently changed first, and show them a picker in the chat: they can pick one, or upload an SVG file from their computer into it. It is the starting point when the user wants to work on one of their own files, saved or on their computer.",
    inputSchema: {
      type: "object",
      properties: { limit: { type: "number", description: "How many to list (default 20, at most 100)." } },
    },
    annotations: READ,
    _meta: { ui: { resourceUri: WIDGET_URI } },
  },

  onDocument("read_svg_lines", "Read lines", "Read lines of the document, numbered. Long lines in the overview are clipped; this returns them whole while the result stays under about 60,000 characters.", {
    start: { type: "number", description: "First line (1-based, inclusive)." },
    end: { type: "number", description: "Last line (inclusive)." },
  }, ["start", "end"], READ),
  onDocument("search_svg", "Search the markup", "Find the lines containing some text (case-insensitive), with their line numbers.", {
    query: { type: "string", description: "Text to look for." },
  }, ["query"], READ),
  onDocument("query", "Find elements", "List the elements an address matches: their positional path, tag, id, class, line and own text. It shows what an edit to that address would change, and how many elements, before the edit.", {
    selector: { type: "string", description: ADDRESS },
    limit: { type: "number", description: "Most matches to list (default 200)." },
  }, ["selector"], READ),
  onDocument("list_path_parts", "List the shapes in a path", "List the separate shapes inside <path> elements, numbered, with their size and position. A traced drawing keeps every region of one colour in one path; split_path takes these numbers.", {
    selector: { type: "string", description: ADDRESS },
  }, ["selector"], READ),
  onDocument("get_png_image", "Look at the drawing", "Look at the drawing: render it as it is now to a PNG, returned to you with a description. show_document shows the drawing to the user; this is how you see it yourself. Use it when the answer is in the pixels — above all to check which anonymous element is the part the user means before you recolour, split or delete it, and to check an edit came out as meant. Give up to four candidate addresses as highlight: each one's matches are drawn in their own colours, ringed in an outline colour of its own, over everything else faded, and the text says which colour is which address, how many matched and where. Then edit with the address whose outline is on the part — a plain picture does not tell you which element is which. crop draws one region of the viewBox at the full picture size, for detail a whole-drawing picture loses. It cannot tell you what the markup contains — ids, attribute values, how many elements there are — query answers that.", {
    highlight: {
      type: "array",
      items: { type: "string" },
      description: "Up to four addresses, each outlined in its own colour: magenta, cyan, green, blue in the order given. Each is a line (\"line 9\") or a positional path (/svg[1]/g[2]/path[7]) naming one element, or a CSS selector naming a set. Leave it out for a plain picture.",
    },
    crop: {
      type: "object",
      properties: { x: { type: "number" }, y: { type: "number" }, width: { type: "number" }, height: { type: "number" } },
      required: ["x", "y", "width", "height"],
      description: "A region in viewBox units, drawn at the full picture size. Leave it out for the whole drawing.",
    },
    size: { type: "number", enum: [256, 512, 1024], description: "Longest side in pixels: 512 unless 512 cannot show what you need." },
  }, [], READ),
  onDocument("get_element_bounds", "Measure elements", "Measure the bounding box (x, y, width, height) of elements, in viewBox units, as drawn: transforms applied, so results are accurate for complex paths. Use it to know where things are before placing, aligning or resizing. It measures only what is DRAWN — gradients, <defs> contents and hidden elements never appear, so use query to know what exists.", {
    selector: { type: "string", description: `${ADDRESS} "*" measures every direct child of the root.` },
  }, ["selector"], READ),

  onDocument("set_attribute", "Set an attribute", "Set or remove an attribute on the addressed elements — the way to recolour, resize or move a shape. Only that attribute changes; the rest of the markup is left exactly as it was. Where the element's own style attribute already sets the property (style=\"fill: …\", as in every traced picture), the new value is written into that declaration, which would otherwise win. Tells you when a <style> rule overrides the attribute, so the change would not show.", edits({
    name: { type: "string", description: "Attribute name, e.g. fill, stroke-width, transform." },
    value: { type: ["string", "null"], description: "The new value, or null to remove the attribute." },
  }, ["name", "value"]), ["edits"], WRITE),
  onDocument("set_text", "Change text", "Replace the text of the addressed elements — the way to relabel or translate. A multi-line label (several <tspan> lines) takes its lines separated by \\n.", edits({
    text: { type: "string", description: "The new text. An empty string clears it." },
  }, ["text"]), ["edits"], WRITE),
  onDocument("set_style_rule", "Change a style rule", "Change one declaration in a rule of the document's <style> block, e.g. fill in .cls-1. It is what changes a drawing styled by classes rather than attributes.", edits({
    property: { type: "string", description: "The CSS property, e.g. fill." },
    value: { type: ["string", "null"], description: "The new value, or null to remove the declaration." },
  }, ["property", "value"]), ["edits"], WRITE),
  onDocument("insert_element", "Insert markup", "Insert new markup before, after or inside the addressed element, without re-typing anything that is already there.", edits({
    position: { type: "string", enum: ["before", "after", "first-child", "last-child"], description: "Where, relative to the addressed element." },
    svg: { type: "string", description: "The markup to insert — one element or several." },
  }, ["position", "svg"]), ["edits"], WRITE),
  onDocument("remove_element", "Remove elements", "Delete the addressed elements and everything inside them.", edits({}, []), ["edits"], DESTRUCTIVE),
  onDocument("split_path", "Split a path", "Replace a <path> with one path per part, as list_path_parts numbers them, optionally giving some parts a new fill — the way to recolour one region of a traced drawing.", edits({
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
  onDocument("replace_lines", "Replace lines", "Replace whole line ranges, by the line numbers the document was shown with. For what has no element to address — a rule in <style>, a document that is not well-formed yet. Every attribute on a replaced line must be written again exactly; the element tools change less.", {
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
  onDocument("replace_svg", "Replace the whole drawing", "Replace the whole document: for starting over, or a change to most of it. Anything not re-typed is lost.", {
    svg: { type: "string", description: "The complete new SVG markup." },
  }, ["svg"], DESTRUCTIVE),
];

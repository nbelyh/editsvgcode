import type { GetPromptResult, Prompt } from "@modelcontextprotocol/sdk/types.js";

/**
 * Starters the user picks in the client (Claude lists them under the connector), so a chat is
 * sent to these tools on purpose rather than by how the request happens to be worded. Each is
 * a message in the user's voice. No arguments: the user says what they want in their own words
 * after it.
 */
const STARTERS: Array<Prompt & { text: string }> = [
  {
    name: "edit_svg_file",
    title: "Edit an SVG file",
    description: "Drop an SVG file into a box in the chat, then say what to change.",
    text: "I have an SVG file to edit with EditSvgCode. Call upload_document so I can drop it into the box; once I have, open_document it, show_document it, and ask me what to change. Do not ask me to attach or paste the file.",
  },
  {
    name: "use_editsvgcode",
    title: "Work with EditSvgCode",
    description: "Use EditSvgCode for every SVG drawing in this chat.",
    text: "For every SVG drawing in this chat, use the EditSvgCode tools. For a file I have, call upload_document; for a new drawing, create_document; for one of my saved drawings, list_documents and open_document. Make changes with the tools that address only what changes (set_attribute, set_text, set_style_rule, insert_element, remove_element, split_path, replace_lines), not by rewriting the whole document with replace_svg. After each round of changes, call show_document so I see the result.",
  },
];

export const PROMPTS: Prompt[] = STARTERS.map(({ text: _text, ...prompt }) => prompt);

export function getPrompt(name: string): GetPromptResult | null {
  const starter = STARTERS.find((s) => s.name === name);
  if (!starter) return null;
  return {
    description: starter.description,
    messages: [{ role: "user", content: { type: "text", text: starter.text } }],
  };
}

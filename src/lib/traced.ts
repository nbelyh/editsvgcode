/**
 * Whether a drawing was traced from a picture (vectorised), read off its markup: the tracer
 * writes every shape as an anonymous <path> placed with translate() and coloured inline —
 * <path d="M0 0 C5 3 …" transform="translate(364,94)" style="fill: #1C1817;"/>. Such a drawing
 * is changed best by the image model (modify_image) whenever the change is more than a recolour,
 * whether or not the picture it came from is still at hand. The editor's chat and the MCP server
 * both ask, so the model hears the same in both.
 */

const TRACED_PATH = /<path\b[^>]*\btransform="translate\([^)]*\)"[^>]*\bstyle="fill: #[0-9A-Fa-f]{6};"/g;
const ANY_PATH = /<path\b/g;
/** Fewer shapes than this is an icon, whatever wrote it. */
const MIN_TRACED_PATHS = 8;

export function looksTraced(svg: string): boolean {
  const traced = svg.match(TRACED_PATH)?.length ?? 0;
  const paths = svg.match(ANY_PATH)?.length ?? 0;
  return traced >= MIN_TRACED_PATHS && traced >= 0.6 * paths;
}

/** What the model is told about a traced drawing, in the editor and through the connector alike. */
export const TRACED_NOTE = 'This drawing was traced from a picture: every shape is an anonymous path, coloured by a style="fill: …" attribute. Recolour a part that has a path of its own with set_attribute. For anything more — adding, removing or reshaping something, a pose, an expression, or a part with no shape of its own (part of the dark layer that draws every outline) — use modify_image: the image model redraws the picture from the drawing as it is now, and the user confirms the price first. Hand-drawn paths will not match the traced ones.';

# Dogfooding the MCP connector

Problems met while using our own connector (`editsvgcode.com/mcp`) for real SVG work, logged as they
happen. An open entry says what was tried, what went wrong, the workaround and a possible fix. Once
fixed, it shrinks to one line under Fixed, with the commit; the details live in the commit message.

## Open

Nothing open.

## Won't fix

- **A part with no shape of its own** (a dark apron or pupil that is the base layer showing through,
  or a path that draws the outlines round the part as well) cannot be recoloured alone by any edit.
  A `fill_region` tool tried: it told areas from lines by thickness. It worked on large areas, but
  pupils came out as lumpy blobs, and models seldom called it even when told. Removed (2026-10-16);
  the rule now is `modify_image`: the image model redraws the part, the user confirms the price.

## Fixed

On branch `claude/mcp-dogfood-tools`, not deployed yet.

- **The model could not see the drawing.** `get_png_image` and `get_element_bounds` are MCP tools now,
  drawn on the server with resvg through the editor's own code; `search_icons` came along. (21a4252)
- **`set_attribute fill` did nothing on a traced path,** whose inline `style` won. The value now goes
  into that style declaration, in the editor too. (21a4252, API d002684)
- **No way to copy a drawing** without retyping it: `copy_document`. (21a4252)
- **`create_document` echoed the whole drawing back:** a large one now gets an outline. (21a4252)
- **`list_path_parts` stopped at 10 paths:** one-shape paths are listed together. (21a4252)
- **No way to get the file itself out,** say for a script to render it, without the model retyping
  it: `export_document` gives a 15-minute download link to the SVG or a PNG. (21a4252)

## Worked well

Worth keeping as they are:

- `list_path_parts` explains a traced base layer plainly, and says what not to do with it.
- `query` takes CSS attribute selectors (`path[style*="#2B150C"]`), handy for finding a colour.
- `remove_element`, `insert_element` and `set_attribute` on `text > tspan` did exactly what they said,
  and left every other line byte-for-byte the same.

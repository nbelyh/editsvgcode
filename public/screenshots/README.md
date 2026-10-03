# Feature Screenshots

## 1. Code Editor

- `01-editor-full.png` — Full editor view, dark theme, syntax highlighting, preview on right
- `02-autocomplete.png` — Autocomplete popup, SVG tag/attribute suggestions with descriptions
- `03-path-commands.png` — Path command completion, cursor inside `d="..."` showing M/L/C commands
- `04-color-completion.png` — Color completion, named colors with swatches

## 2. Live Preview

- `05-zoom-controls.png` — Zoom controls, zoomed-in SVG showing zoom toolbar
- `06-background-modes.png` — Background modes, 2×2 grid: same SVG on checkerboard/white/black/dark
- `07-click-to-select.png` — Click-to-select, element highlighted with dashed outline, code selected in editor

## 3. AI Chat

- `08-chat-conversation.png` — Chat conversation, "make the circle red" → diff view
- `09-diff-view.png` — Monaco diff editor with accept/reject buttons
- `10-model-selector.png` — Dropdown open showing models + reasoning effort

## 4. AI Image Generation

- `11-image-generation.png` — "draw a cat", raster + vectorized SVG side by side
- `12-vectorizer-controls.png` — Parameter sliders (color precision, speckle filter etc.)
- `16-image-modification.png` — Iterative image editing: generate a kitten, then modify it to add a bow

## 5. Icon Search

- `13-icon-picker.png` — Grid of icon results with "Use" buttons

## 6. File Management

- `14-files-page.png` — Grid of saved files with thumbnails
- `15-share-toggle.png` — Public/private lock icon in toolbar
- `22-files-drafts.png` — Files page with the Drafts list (unsaved documents with a chat)

## 7. Gallery

- `17-gallery.png` — Gallery grid, CC0 note and title/description filter
- `18-clone-with-chat.png` — A cloned gallery drawing with the original AI conversation in the sidebar
- `19-share-menu.png` — Share menu showing the three visibility states (Private / Unlisted / Publish to gallery)
- `20-publish-dialog.png` — Publish dialog: title, description, CC0 terms, "Suggest with AI"

## 8. Models

- `21-model-picker.png` — Model picker grouped into Free / Pro with per-request credit costs

## 9. Structural Editing

- `23-structural-edits.png` — A diagram translated and recoloured through query / set_text /
  set_style_rule, both proposals accepted. Taken against a scripted model (`/api/chat` stubbed
  in `screenshots.spec.ts`), so the tool names in it are fixed — as are those in 25–27.

## 10. Chat, September 2026

- `25-split-path.png` — A traced tree that was one path, recoloured part by part through
  list_path_parts / split_path: leaves green, trunk brown
- `26-pasted-svg.png` — SVG code pasted into the chat, opened in the editor with no model call
- `27-streamed-reasoning.png` — A finished streamed reply with its Reasoning section opened

Thumbnails are the full shots at half width, 700px, as palette PNGs (sharp:
`resize({ width: 700 }).png({ palette: true })`).

## 11. Export, October 2026

Taken by `screenshots-export.spec.ts` in the real Chrome, in a window, at 1.5×, and cropped to the
dialog; the headless browser draws text thinner and softer. The thumbnails are the same files. The
pages show them at their own size (`density: 1.5`) and never stretch them.

- `28-export-image.png` — Export image panel: the square logo as a 1200 × 630 social card, proportions
  unlocked, centred on white
- `29-favicon-icons.png` — Favicon and app icons panel: the 16 / 32 / 48 px and iPhone previews and the
  `<head>` lines
- `30-copy-as-code.png` — Copy as code panel showing the drawing as a React component

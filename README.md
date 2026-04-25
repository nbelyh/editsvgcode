# editsvgcode — Online SVG Code Editor

An SVG code editor with AI assistance, schema-aware autocomplete, and live preview.

**[editsvgcode-beta.web.app](https://editsvgcode-beta.web.app)**

[![](https://editsvgcode-beta.web.app/screenshots/01-editor-full.png)](https://editsvgcode-beta.web.app)

## Code Editor

### Monaco Editor
The same engine used in VS Code. Syntax highlighting, bracket matching, code folding, multi-cursor editing, find/replace with regex, and minimap. Live preview updates as you type.

### Element Autocomplete
Type `<` to get all valid SVG elements with descriptions, generated from the SVG spec schema.

![Autocomplete](https://editsvgcode-beta.web.app/screenshots/02-autocomplete.png)

### Hover Documentation
Hover over any SVG element or attribute to see its description from the SVG specification.

![Hover Documentation](https://editsvgcode-beta.web.app/screenshots/02b-hover-tooltip.png)

### Attribute & Value Completion
Context-aware attribute suggestions for each specific element. For attributes with fixed values (stroke-linecap, font-style, etc.), suggests the valid options.

![Attribute Completion](https://editsvgcode-beta.web.app/screenshots/03-attribute-completion.png)

### Color Picker
Inline color swatches with a picker supporting hex, RGB, HSL, and named SVG colors.

![Color Picker](https://editsvgcode-beta.web.app/screenshots/04-color-completion.png)

## Live Preview

### Zoom Controls
Zoom in/out, reset, fit to window. Ctrl+scroll supported.

![Zoom Controls](https://editsvgcode-beta.web.app/screenshots/05-zoom-controls.png)

### Background Modes
Light/dark checkerboard, solid white, solid black. Checkerboard makes transparent regions visible.

![Background Modes](https://editsvgcode-beta.web.app/screenshots/06-background-modes.png)

### Click-to-Select
Click an element in the preview to jump to the corresponding source code. Bounding box highlight on selected elements.

![Click-to-Select](https://editsvgcode-beta.web.app/screenshots/07-click-to-select.png)

## Cloud Storage
Save files with auto-generated thumbnails. Toggle public/private per file. Shareable links for public files.

![Cloud Storage](https://editsvgcode-beta.web.app/screenshots/14-files-page.png)

## AI Tools (Pro)

### AI Chat
Type a request like "make the circles red" or "add a drop shadow to all text". The AI reads your SVG, generates modified code, and shows a diff. Multi-turn conversations build on previous context.

![AI Chat](https://editsvgcode-beta.web.app/screenshots/08-chat-conversation.png)

### Image Generation & Vectorizer
Describe an image in text, the AI generates a PNG, and the built-in vectorizer converts it to SVG paths. Tune colors, speckle filtering, corner threshold, and curve optimization.

![Image Generation](https://editsvgcode-beta.web.app/screenshots/11-image-generation.png)

### Image Modification
Ask the AI to modify a previously generated image, then re-vectorize to SVG. Chain multiple modifications in the same conversation.

![Image Modification](https://editsvgcode-beta.web.app/screenshots/16-image-modification.png)

### Model Selector
Switch between AI models from a dropdown. A reasoning effort slider trades speed for quality on complex edits.

![Model Selector](https://editsvgcode-beta.web.app/screenshots/10-model-selector.png)

### Icon Search
Search 200,000+ open-source icons (Material, FontAwesome, Lucide, etc.). The AI inserts selected icons as inline SVG paths, positioned and scaled to fit.

![Icon Search](https://editsvgcode-beta.web.app/screenshots/13-icon-picker.png)

## Development

```bash
npm install
npm run dev        # Start dev server + Firebase emulators
npm run build      # Build for production
npm run test       # Run unit tests
npm run test:e2e   # Run Playwright e2e tests
```

## License

[MIT](LICENSE)

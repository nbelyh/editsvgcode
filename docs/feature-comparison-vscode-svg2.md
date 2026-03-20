# Feature Comparison: editsvgcode vs vscode-svg2

Reference: [lishu/vscode-svg2](https://github.com/lishu/vscode-svg2) (MIT, v1.5.4, paused 2023)

## Already implemented in editsvgcode

| Feature | vscode-svg2 | editsvgcode |
|---------|-------------|-------------|
| SVG autocompletion (context-aware) | ✅ | ✅ |
| Live preview | ✅ | ✅ |
| Zoom (buttons, scroll, presets) | ✅ | ✅ (richer: 1–5000%+, Ctrl+scroll) |
| Background toggle | ✅ (6 modes) | ✅ (4 modes) |
| Auto-fit on load | ✅ | ✅ |
| MDN hover documentation | ✅ | ✅ |
| Click-to-select in preview | ❌ | ✅ (hover + click + Ctrl+multi-select) |
| XML formatting | ✅ | ✅ |
| Cloud save/load | ❌ | ✅ (Firebase) |

## Missing — already in PLAN.md (Phase 1.3–1.9)

| Feature | vscode-svg2 | PLAN phase |
|---------|-------------|------------|
| Document Symbol tree (element outline) | ✅ | 1.3 |
| Minify SVG (SVGO) with per-plugin config | ✅ (30+ SVGO options) | 1.4 |
| Export PNG | ✅ | 1.5 |
| Copy as Data URI | ✅ | 1.5 |
| Go to `id` definition (Ctrl+click `url(#id)`) | ✅ | 1.6 |
| Rename id references (F2 on `id="..."`) | ✅ | 1.7 |
| Path data highlighting (grammar colors in `d="..."`) | ✅ | 1.8 |
| Color picker (inline color swatch + picker) | ✅ | 1.9 |

## Missing — NOT in PLAN.md yet

| Feature | vscode-svg2 | Notes |
|---------|-------------|-------|
| Emmet abbreviation support (e.g. `rect.cls>line*3`) | ✅ | Could add via Monaco Emmet plugin |
| Preview ruler (pixel ruler overlay) | ✅ | Nice-to-have precision tool |
| Preview crossline (crosshair cursor with coordinate readout) | ✅ | Complements ruler |
| Embedded CSS/JS syntax highlighting in `<style>`/`<script>` | ✅ (custom TextMate grammar) | Monaco XML mode doesn't highlight embedded CSS/JS |
| CSS color picker inside `<style>` blocks | ✅ | Extends the inline color picker |
| Show deprecated completions toggle | ✅ (setting) | Elements flagged but no toggle to hide them |
| Preview mode: SVG-in-HTML vs `<img>` | ✅ | `<img>` mode blocks scripts/external refs (safer) |
| Preview All SVG (workspace-wide gallery) | ✅ | N/A for single-file web editor |
| Custom SVG language definition (separate from XML) | ✅ | Currently using `xml` mode; custom `svg` language could enable SVG-specific tokenization |

## Impact assessment (unplanned features)

**High impact:** Ruler + crossline, embedded CSS/JS syntax highlighting
**Medium impact:** Emmet support, deprecated completions toggle
**Low impact / N/A:** Preview All SVG (single-file editor), SVG-vs-img preview mode

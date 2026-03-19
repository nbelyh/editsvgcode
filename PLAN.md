# editsvgcode — AI Monetization Implementation Plan

## Overview

Transform editsvgcode.com from a free SVG code editor ($15/month ads) into an AI-powered SVG editing platform ($500-2,000/month subscriptions).

- **Current:** 30K visits/month, Carbon Ads revenue ~$15/month
- **Target:** $500-2,000/month via Pro subscriptions at $9/month

## Target Stack

- **Frontend:** React 19 + Vite + TypeScript + Mantine
- **AI Chat UI:** VS Code-style sidebar (CopilotKit or custom Mantine — TBD, needs VS Code Copilot Chat look & feel)
- **Editor:** @monaco-editor/react (includes diff editor for AI proposals)
- **Split panes:** allotment
- **Backend:** Azure Function (AI proxy, rate limiting, PayProGlobal webhooks)
- **AI Model:** GPT-4o on Azure OpenAI (primary), GPT-4o-mini (simple edits)
- **BYOL:** Bring Your Own LLM — users pick provider (OpenAI, Anthropic, Google, etc.) + enter their key
- **Payments:** PayProGlobal (subscription)
- **Auth:** Firebase Auth (email + Google sign-in, upgrade from anonymous)
- **DB:** Firebase Firestore (existing, add user/subscription collections)

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 5 AI edits/day, ads shown, basic exports, full editor |
| Pro | $9/month or $79/year | Unlimited AI, no ads, all exports, priority model |
| BYOL | Free or $3/month | Bring your own LLM provider + API key |

## Open Decisions

- [ ] AI Chat UI library: assistant-ui vs CopilotKit vs custom Mantine (want VS Code Copilot Chat look)
- [ ] BYOL: direct client-to-provider calls (skip proxy) vs proxy all through Azure Function

---

## Phase 0: Rewrite to React + Vite + Mantine ✅ COMPLETE

**Goal:** Modernize the stack without changing any user-facing behavior.

### 0.1 Scaffold new project ✅

- `npm create vite@latest -- --template react-ts`
- Install: `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@tabler/icons-react`, `@monaco-editor/react`, `allotment`
- Configure Vite, Mantine (`MantineProvider`, `createTheme`, `ColorSchemeScript`)
- Set up Firebase 11 (modular SDK, tree-shakeable)

### 0.2 Port the layout ✅

- App.tsx: Mantine `AppShell` + main area (3 panes via allotment) + footer
- Dark theme via Mantine `colorScheme: 'dark'` in `createTheme()`
- Match current look & feel (dark bg, split panes)

### 0.3 Port the editor ✅

- Editor.tsx: Monaco editor with XML language, vs-dark theme
- Port XML formatting provider
- Port SVG completion provider + hover provider (svg-schema.js)
- Port SVG schema data (svg-schema.js → TypeScript)

### 0.4 Port the preview ✅

- Preview.tsx: Renders editor content as innerHTML
- Re-render on editor content change

### 0.5 Port Firebase integration ✅

- firebase.ts: Modular SDK (initializeApp, getFirestore, getAuth)
- Anonymous auth → load/save documents
- Cloud save + URL-based document loading
- Emulator detection for localhost

### 0.6 Port toolbar actions ✅

- Upload SVG file, Download SVG, Save to cloud
- Tooltips (Mantine `Tooltip` instead of Tippy.js)

### 0.7 Port sidebar ✅

- Info tab with current help text
- Carbon Ads script inclusion

### 0.8 Modernize SVG schema ✅

**Approach:** Use existing `svg-schema.js` as the base (produced from SVG 1.1 XSD + MDN scraping by C# `convert_schema`). Write a Node.js enhancement script that patches it with SVG2 additions and curated improvements. No XSD needed — SVG 2 deliberately dropped formal DTD/XSD. BCD (`@mdn/browser-compat-data`) evaluated and rejected — it's a browser-support database, not documentation (no descriptions, no child elements, no value enumerations).

**Script:** `scripts/generate-schema.cjs` — Node.js script that:
1. Loads current `svg-schema.js` as structural base
2. Re-scrapes MDN for fresh element/attribute descriptions (URLs changed to `/docs/Web/SVG/Reference/Element/`)
3. Patches in the enhancements below
4. Outputs updated `src/svg-schema.js`

**Enhancements:**
- Mark deprecated elements (altGlyph, altGlyphDef, altGlyphItem, glyphRef, tref, cursor, animateColor, font, glyph, missing-glyph, hkern, vkern, font-face, font-face-src, font-face-uri, font-face-format, font-face-name, definition-src, color-profile) — keep them in schema but flag as deprecated
- Add SVG2 elements: `feDropShadow`, `foreignObject` (already present)
- Add SVG2 attributes: `href` (on a, image, use, linearGradient, radialGradient, pattern, feImage, mpath, script, set, animate, animateMotion, animateTransform, textPath), `pathLength` (on rect, circle, ellipse, line, polyline, polygon, path), `tabindex` + `autofocus` (global), `vector-effect` + `transform-origin` (global presentation), `fr` (on radialGradient)
- Add attribute value enumerations: stroke-linecap (butt/round/square), stroke-linejoin (miter/round/bevel), fill-rule (nonzero/evenodd), clip-rule, text-anchor (start/middle/end), dominant-baseline, text-decoration, font-style, font-weight, font-stretch, visibility, overflow, display, pointer-events, shape-rendering, text-rendering, image-rendering, color-interpolation, preserveAspectRatio values, spreadMethod, gradientUnits, clipPathUnits, maskUnits/maskContentUnits, patternUnits/patternContentUnits, marker orient, lengthAdjust, etc.
- Add path command data: M/m, L/l, H/h, V/v, C/c, S/s, Q/q, T/t, A/a, Z/z — descriptions + parameter formats (shown in `d` attribute hover/completion)
- Add CSS named color completions (148 named colors) + functional syntax hints (rgb, hsl, oklch)
- Fill in null descriptions for attributes currently missing documentation
- Consider switching editor language from 'xml' to 'html' (auto-close tags, CSS-in-SVG) + keep custom SVG providers on top

### 0.9 Update build/deploy ✅

- Update firebase.json if needed (still serves from dist/)
- Verify `npm run build` produces working output
- Test full flow: edit, preview, save, load, upload, download

**Deliverable:** Identical app, new stack, modernized SVG schema. Deploy to Firebase Hosting.

**Claude prompt:** "Rewrite the editsvgcode project from vanilla JS + Webpack + Bootstrap to React 19 + Vite + TypeScript + Mantine. Preserve all existing functionality: Monaco SVG editor with autocomplete, live preview, Firebase anonymous auth, save/load documents, upload/download files. Use @mantine/core + @mantine/hooks for UI, @tabler/icons-react for icons, @monaco-editor/react and allotment for split panes. Configure MantineProvider with dark colorScheme. Also modernize the SVG schema: replace the XSD-based C# generator with a Node.js script using @mdn/browser-compat-data, remove deprecated SVG 1.1 elements, add SVG2 attributes, add comprehensive attribute value enumerations, add path command data, and switch to HTML language mode with custom SVG providers on top."

---

## Phase 1: Enhanced UX Features ← CURRENT

**Goal:** Make the editor best-in-class for free users, increase engagement. Reference: [vscode-svg2](https://github.com/lishu/vscode-svg2) (MIT) for feature inspiration and code patterns.

### 1.1 Preview enhancements ✅

- ✅ Zoom: Ctrl+scroll, zoom-in/out/reset/fit buttons, preset levels (1%-5000%+), no hard cap
- ✅ Background toggle: checkerboard / white / black / none (SegmentedControl)
- ✅ Auto-fit on load: large SVGs scale to fit viewport
- ✅ Scroll-center preservation during zoom
- ✅ Robust viewBox handling: percentage dimensions, missing viewBox, getBBox fallback
- ✅ Toolbar with zoom controls + background switcher

### 1.1b Bugfixes & polish ✅

- ✅ Fix: strip BOM from loaded SVG files (use readAsText instead of base64 roundtrip)
- ✅ Rename toolbar buttons: Open / Download / Share (was Upload / Download / Save)

### 1.2 Click-to-select in preview

- Click SVG element in preview → highlight with dashed outline
- Extract clicked element's XML from editor
- Scroll editor to the selected element
- Pass selection context to AI (Phase 2) automatically
- Deselect on click outside

### 1.3 SVG Element Tree

- TreeView.tsx in sidebar tab: collapsible tree of SVG DOM
- Click tree node → highlight in preview + scroll in editor
- Show element type + id + key attributes
- Bidirectional sync: preview ↔ tree ↔ editor
- *Note: Monaco already provides code folding for XML; this adds visual overview + preview integration*
- *Ref: vscode-svg2 DocumentSymbol tree in outline panel*

### 1.4 SVG Optimization (SVGO)

- Install svgo (runs client-side)
- Button in toolbar: "Optimize"
- Show before/after file size
- Use Monaco diff to preview optimization changes
- *Ref: vscode-svg2 "Minify SVG" command (note: they warn SVGO can break SVGs — add undo/diff review)*

### 1.5 Export options

- SVG → PNG (render to canvas, resolution picker)
- SVG → React JSX component
- SVG → Data URI / Base64
- SVG → Copy to clipboard
- Export dropdown in toolbar
- *Ref: vscode-svg2 "Export PNG" feature*

### 1.6 Go to id definition / references

- Ctrl+click on `url(#id)` → jump to the element with that `id`
- Ctrl+click on `href="#id"` or `xlink:href="#id"` → same
- Hover on `url(#id)` → show target element preview
- *Ref: vscode-svg2 "In Id Reference Click Goto id="" element"*

### 1.7 Rename id references

- Place cursor on `id="foo"` → F2 → rename `id` and all `url(#foo)`, `href="#foo"` references
- *Ref: vscode-svg2 "Rename Tag Name or Id Reference"*

### 1.8 Path data intelligence

- Path command completion inside d="..." (M, L, C, S, Q, T, A, Z with parameter snippets)
- Hover tooltips explaining path commands + expected parameters
- Path segment highlighting in preview as cursor moves through d="..." data
- (Future) Visual path point dragging in preview — edit control points visually

### 1.9 Enhanced color intelligence

- Named SVG color completions (aliceblue, coral, etc.)
- Functional color syntax (rgb(), hsl())
- url(#id) completions — suggest IDs of gradients, patterns, clip-paths defined in the document
- `currentColor`, `inherit`, `none`, `transparent` suggestions

**Deliverable:** Feature-rich free editor that competes with 4-5 separate tools.

---

## Phase 2: AI Sidebar MVP

**Goal:** Working AI chat that can edit SVG. No payments, no auth upgrade. Free for everyone, 5/day limit via localStorage counter. Builds on Phase 1's click-to-select for contextual editing.

### 2.1 Azure Function setup

- Create Azure Function App (Node.js, consumption plan)
- POST /api/chat endpoint
- Accepts: messages array, current SVG, selected element
- Calls Azure OpenAI (GPT-4o) with SVG-specific system prompt
- Returns: streaming response with tool calls
- Rate limiting: check X-Forwarded-For or anonymous UID, 5/day
- CORS configuration for editsvgcode.com

### 2.2 Define AI tools/functions

- `replace_svg(svg_code)` — full SVG replacement
- `edit_element(selector, attributes, action)` — targeted edit
- `insert_element(parent_selector, position, svg_fragment)` — add new
- `get_svg_structure()` — model calls this to understand document
- System prompt: SVG editing assistant, rules, output format

### 2.3 AI sidebar UI (VS Code style)

- VS Code Copilot Chat-like panel in sidebar
- Message list, input, streaming display
- Model selector dropdown
- Wire to Azure Function endpoint
- Show tool call results (what the AI is doing)
- Client-side rate limit display ("3 of 5 free edits used today")

### 2.4 Apply AI edits to editor

- When AI calls replace_svg → switch Monaco to diff mode
- Show original vs proposed (inline diff)
- Preview pane shows the proposed SVG rendered
- Accept button: commit new SVG, switch back to normal editor
- Reject button: discard, revert preview

### 2.5 Streaming UX

- Stream AI text responses in the chat
- Show "thinking..." indicator
- Abort button to cancel mid-stream

### 2.6 Test & iterate on prompt quality

- Test: "make the rectangle blue"
- Test: "add a drop shadow"
- Test: "create a 200x200 circle"
- Test: "animate the element"
- Tune system prompt based on results

**Deliverable:** Working AI SVG editor with chat, diff preview, 5/day free limit.

**Claude prompt:** "Add a VS Code Copilot Chat-style AI sidebar to the editsvgcode React app. Create an Azure Function that proxies to Azure OpenAI GPT-4o with tool-calling for SVG edits. When AI proposes changes, show Monaco diff editor with accept/reject. Rate limit to 5 requests/day per user (localStorage counter for now). Include model selector dropdown."

---

## ⏸️ MEASUREMENT PAUSE (2-3 weeks)

Deploy Phase 2, monitor:

- How many users try the AI feature?
- How many hit the 5/day limit?
- What do they ask for? (Log prompts, anonymized)
- Is AI output quality good enough?

**If signals are good (>10% try, >1% hit limit) → proceed to Phase 3.**

---

## Phase 3: Payments & User Management

**Goal:** Monetize with subscriptions via PayProGlobal.

### 3.1 Firebase Auth upgrade

- Add Google sign-in + email/password (keep anonymous as fallback)
- User avatar/menu in navbar (Mantine `Menu`)
- Login/signup dialog (Mantine `Modal`)
- Link anonymous account to real account (preserve saved documents)

### 3.2 User profile & settings

- Settings dialog: account info, subscription status
- BYOL configuration: user picks provider (OpenAI / Anthropic / Google) + enters API key
- BYOL keys stored in localStorage (never sent to your server)
- BYOL requests go direct from browser to AI provider (skip Azure Function)
- Model selector in AI sidebar reflects available models per provider

### 3.3 PayProGlobal integration

- Create subscription products: Pro Monthly ($9/mo), Pro Annual ($79/yr)
- "Upgrade to Pro" button → redirects to PayProGlobal checkout (pass Firebase UID)
- Azure Function: POST /api/webhook/payproglobal
  - Verify IPN signature
  - On payment: write to Firestore users/{uid}/subscription
  - On cancellation: update subscription status
- Client reads subscription status from Firestore on load

### 3.4 Enforce tiers

- Azure Function: check subscription before processing AI request
- Free: 5/day (server-enforced)
- Pro: unlimited (soft cap 500/day for abuse)
- BYOL: client-side calls, no server enforcement needed
- Remove ads for Pro users

### 3.5 Usage dashboard

- Counter in AI sidebar: "3/5 free edits today" or "Pro ∞"
- Settings page: monthly usage stats

**Deliverable:** Working subscription system with BYOL support.

**Claude prompt:** "Add user authentication (Firebase Auth with Google + email), PayProGlobal subscription integration (webhook to Azure Function, subscription status in Firestore), BYOL support (user picks LLM provider + enters API key, stored in localStorage, calls go direct to provider), and tier enforcement to editsvgcode."

---

## Phase 4: Growth Features

**Goal:** Drive more traffic and increase retention.

### 4.1 SVG search & import

- Azure Function: GET /api/search?q=shopping+cart
- Aggregates: SVG Repo API, Lucide GitHub, Material Icons API
- Returns: thumbnails, license info, SVG content URLs
- Chat UI: grid of results, license badges, "Use" button
- Import: loads SVG into editor with license comment
- License filter: only show MIT/CC0/Apache/CC-BY results

### 4.2 AI SVG generation

- "Create a pie chart showing 40% blue, 35% green, 25% red"
- Uses same Azure Function + AI, different system prompt
- Result appears in editor

### 4.3 SEO & marketing pages

- /tools/svg-to-react — landing page for React conversion
- /tools/svg-optimizer — landing page for SVGO
- /tools/svg-icons — landing page for icon search
- Meta tags, Open Graph, structured data

### 4.4 PWA support

- Service worker for offline basic editing
- Install prompt

**Deliverable:** Full-featured SVG platform with multiple traffic entry points.

---

## Timeline

```text
Phase 0: React rewrite              ~1-2 weekends
Phase 1: AI sidebar MVP             ~1-2 weekends
  → DEPLOY & MEASURE 2-3 WEEKS
Phase 2: Enhanced UX                ~1-2 weekends
Phase 3: Payments                   ~1-2 weekends
Phase 4: Growth                     ongoing
```

## Manual Steps (Not Claude's Job)

- [ ] Create Azure OpenAI resource + deploy GPT-4o model
- [ ] Create Azure Function App in Azure Portal
- [ ] Create PayProGlobal account + subscription products
- [ ] Enable Firebase Auth providers (Google) in Firebase Console
- [ ] Monitor analytics after Phase 1 launch
- [ ] Product Hunt / Hacker News launch post

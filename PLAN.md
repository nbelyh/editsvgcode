# editsvgcode — AI Monetization Implementation Plan

## Overview

Transform editsvgcode.com from a free SVG code editor ($15/month ads) into an AI-powered SVG editing platform ($500-2,000/month subscriptions).

- **Current:** 30K visits/month, Carbon Ads revenue ~$15/month
- **Target:** $500-2,000/month via Pro subscriptions at $9/month

## Target Stack

- **Frontend:** React 19 + Vite + TypeScript + Mantine
- **AI Chat UI:** assistant-ui (headless primitives + useExternalStoreRuntime, custom dark theme CSS)
- **Editor:** @monaco-editor/react (includes diff editor for AI proposals)
- **Split panes:** allotment
- **Backend:** Azure Function (AI proxy, rate limiting, PayProGlobal webhooks)
- **AI Model:** Azure OpenAI Responses API — gpt-4.1 (primary), gpt-4.1-mini (simple edits)
- **BYOL:** Bring Your Own LLM — users pick provider (OpenAI, Anthropic, Google, etc.) + enter their key
- **Payments:** PayProGlobal (subscription)
- **Auth:** Firebase Auth (email + Google sign-in, upgrade from anonymous)
- **DB:** Firebase Firestore (existing, add user/subscription collections)

## Pricing & Monetization

### Cost Analysis (April 2026)

**Azure OpenAI model costs (per 1M tokens, Global Standard):**

| Model | Input | Cached Input | Output | Reasoning? |
|-------|-------|-------------|--------|-----------|
| gpt-4o-mini | $0.15 | $0.075 | $0.60 | No |
| gpt-4.1-mini | $0.40 | $0.10 | $1.60 | No |
| gpt-4.1 | $2.00 | $0.50 | $8.00 | No |
| gpt-5-mini | $0.25 | $0.03 | $2.00 | Yes |
| gpt-5 | $1.25 | $0.13 | $10.00 | Yes |
| gpt-5.1 | $1.25 | $0.13 | $10.00 | Yes (defaults to none) |
| gpt-5.1-codex-mini | $0.25 | $0.03 | $2.00 | Yes |
| gpt-5.1-codex | $1.25 | $0.13 | $10.00 | Yes |
| gpt-5.2 | $1.75 | $0.18 | $14.00 | Yes |
| gpt-5.2-codex | $1.75 | $0.18 | $14.00 | Yes |
| gpt-5.4-mini | ~$0.25 | ~$0.03 | ~$2.00 | Yes (pricing TBD) |
| gpt-5.4 | TBD | TBD | TBD | Yes (pricing TBD) |
| gpt-image-1-mini | $2.00 (text) | $0.25 | $8.00 (image) | — |
| gpt-image-1.5 | $5.00 (text) | $1.25 | $32.00 (image) | — |
| gpt-image-1 | $5.00 (text) | $1.25 | $40.00 (image) | — |

**Notes on model families:**
- All GPT-5.x models are **reasoning models** (adaptive thinking). GPT-4.x are non-reasoning.
- All `-codex` models are **Responses API only** — our code already uses Responses API, so all models are available.
- `gpt-5.1` has `reasoning_effort` defaulting to `none` — must explicitly set it for reasoning.
- `gpt-5.2`, `gpt-5.4` require **limited access registration** on Azure.

**Real SVG size data (500-doc Firestore sample):**

| Metric | Characters | Est. Tokens (~4 chars/token) |
|--------|-----------|------------------------------|
| Median | 2,695 | ~674 |
| Average | 20,479 | ~5,120 |
| P90 | 28,051 | ~7,013 |
| P95 | 49,292 | ~12,323 |
| P99 | 525,494 | ~131K |
| Max | 928,861 | ~232K |

63% of SVGs are under 5K chars. Only 5% exceed 50K chars.

**Actual cost per AI request (with system prompt ~500 tokens, ~1K output):**

| Operation | Typical cost | Notes |
|-----------|-------------|-------|
| Chat edit (median SVG, mini model) | $0.001 | ~1.2K input tokens |
| Chat edit (P90 SVG, mini model) | $0.004 | ~7.5K input tokens |
| Chat edit (P99 SVG, mini model) | $0.035 | ~131K input tokens |
| Chat edit (median SVG, full model) | $0.013 | ~1.2K input + reasoning overhead |
| Image gen (gpt-image-1-mini) | $0.03 | ~1.2K text in, ~3K image out |
| Image gen (gpt-image-1.5) | $0.10 | ~1.2K text in, ~3K image out |
| Image gen (gpt-image-1) | $0.13 | ~1.2K text in, ~3K image out |

### Credit System

**Fixed credits per model** — simple for users to understand. More powerful models cost more credits.

#### Free tier models (available to all signed-in users)

| Model | Credits/request | Notes |
|-------|----------------|-------|
| gpt-4o-mini | 1 | Cheapest, fast, non-reasoning |
| gpt-4.1-mini | 1 | Better at code, fast, non-reasoning |
| gpt-5-mini | 3 | Entry-level reasoning |
| gpt-5.1-codex-mini | 3 | Code-optimized reasoning |
| gpt-5.4-mini | 3 | Latest reasoning mini |
| gpt-image-1-mini | 10 | Image generation |

#### Pro-only models (unlocked with Pro subscription)

| Model | Credits/request | Notes |
|-------|----------------|-------|
| gpt-4.1 | 5 | Full-size non-reasoning |
| gpt-5 | 15 | Full-size reasoning |
| gpt-5.1 | 15 | Adaptive reasoning |
| gpt-5.1-codex | 15 | Full-size code reasoning |
| gpt-5.2 | 20 | Frontier reasoning |
| gpt-5.2-codex | 20 | Frontier code reasoning |
| gpt-5.4 | 20 | Latest frontier |
| gpt-image-1.5 | 30 | Better image gen |
| gpt-image-1 | 50 | Best image gen |

**Design for extensibility:** Credit table is `Record<string, { credits: number, tier: "free"|"pro" }>`. Adding Claude or other providers later = add rows + provider routing.

### Tiers

| Tier | Price | Credits | Estimated cost ceiling | Margin |
|------|-------|---------|----------------------|--------|
| Free | $0 | 50/month | ~$3 | marketing cost |
| Pro | $9/month or $79/year | 1000/month | ~$30/month worst case | ~50%+ after PPG fees |
| BYOL | $0 | ∞ (user's key) | $0 | free tier, drives engagement |

Free user gets ~50 cheap edits, or ~16 reasoning edits, or 5 image gens, or a mix.
Pro user gets enough for daily heavy use across all model tiers.

### Top-up Credit Pack (via PPG one-time purchase)

| Pack | Credits | Price |
|------|---------|-------|
| Bulk | 1,000 | $15 |

One-time alternative to subscription for occasional users.

### PayProGlobal Capabilities

- [x] **Subscription billing:** Pro Monthly / Pro Annual — standard recurring product
- [x] **Credit packs:** One-time purchase product + `OrderCharged` webhook → add credits to Firestore
- [x] **Usage-based billing:** PPG has a dedicated usage-based billing page + API support
- [x] **Reference charges:** `Orders/DoReferenceCharge` API allows charging stored payment methods for usage (documented use case: "you track usage and the customer pays based on that")
- [x] **AI tools page:** PPG actively markets to AI tool vendors, supports hybrid billing
- PPG does NOT have built-in metering — credit ledger lives in our Firestore, PPG is the payment rail

### Key Decisions

- [x] Launch at $9/month — prove demand first, raise to $12-15 after 3 months of data
- [x] Fixed credits per model (not token-based) — simple UX, predictable for users
- [x] Free tier gets mini models + 1 image model — enough to taste reasoning, upsell to Pro for full models
- [x] Responses API for all models — already in use, enables `-codex` models too
- [x] Top-up packs via PPG one-time purchase + webhook — no Stripe needed
- [x] Free tier: 50 credits/month (enough to see value, not enough for daily use)
- [x] No nano models — too risky for SVG quality (structured tool calls + XML generation)
- [ ] Consider max SVG size limit for AI features (~100K chars) — P99 users consume 30x more tokens

## Open Decisions

- [x] AI Chat UI library: **assistant-ui** — headless primitives, custom runtime via useExternalStoreRuntime, dark theme CSS
- [x] BYOL: direct client-to-provider calls (skip proxy) — decided, keys stay in localStorage, never touch server
- [x] Auth for AI endpoint: Firebase ID tokens from Phase 2 (anonymous auth already exists), server-side Firestore rate limiting

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

## Phase 1: Enhanced UX Features ✅ COMPLETE

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

### 1.2 Click-to-select in preview ✅

- ✅ Click SVG element in preview → highlight with dashed filter
- ✅ Hover effect with filter highlight
- ✅ Multi-select with Ctrl+click
- ✅ Scroll editor to the selected element
- ✅ Pass selection context to AI (Phase 2) automatically

### 1.3 Path data intelligence ✅

- ✅ Path command completion inside d="..." (M/m, L/l, H/h, V/v, C/c, S/s, Q/q, T/t, A/a, Z/z with parameter snippets)
- ✅ Hover tooltips explaining path commands + expected parameters
- Path segment highlighting in preview as cursor moves through d="..." data — deferred to Phase 3
- (Future) Visual path point dragging in preview — edit control points visually

### 1.4 Enhanced color intelligence ✅

- ✅ Named SVG color completions (148 colors: aliceblue, coral, etc.)
- ✅ Functional color syntax (rgb(), rgba(), hsl() with parameter snippets)
- ✅ url(#id) completion template
- ✅ `currentColor`, `inherit`, `none`, `transparent` suggestions

**Deliverable:** Solid free editor with preview interactions, smart completions, and color/path intelligence.

---

## Phase 2: AI Sidebar MVP ✅ COMPLETE

**Goal:** Working AI chat that can edit SVG. No payments, no auth upgrade. Free for everyone, 5/day server-enforced limit. Builds on Phase 1's click-to-select for contextual editing.

**Security notes (open-source repo):**
- Azure Function is the AI proxy — OpenAI key lives only in Function environment variables, never in frontend
- Firebase Auth ID tokens used from day one (anonymous auth already exists) — server validates every request
- Azure Function URL stored in `VITE_API_URL` env variable (`.env` gitignored), not hardcoded in source
- CORS locked to `https://editsvgcode.com` (+ `localhost` for dev)
- Rate limiting enforced server-side in Firestore — localStorage counter is UX display only

### 2.1 Azure Function setup ✅

- ✅ Azure Function App (Node.js) with POST /api/chat endpoint
- ✅ Validates Firebase Auth ID tokens, extracts UID
- ✅ Server-side rate limiting in Firestore (usage/{uid}/daily)
- ✅ Calls Azure OpenAI Responses API (gpt-4.1-mini default)
- ✅ CORS configured

### 2.2 Define AI tools/functions ✅

- ✅ `replace_svg(svg_code)` — full SVG replacement
- ✅ `replace_lines` — targeted line-range edits for large SVGs
- ✅ `replaceAll` option for bulk text replacements
- ✅ System prompt with SVG editing rules
- ✅ Selection context passed to AI automatically

### 2.3 AI sidebar UI ✅

- ✅ VS Code Copilot Chat-like panel in sidebar
- ✅ Message list, input, streaming display
- ✅ Per-file chat storage in IndexedDB
- ✅ Token cost tracking per message (model, input/output tokens, cost)
- ✅ Daily cost display with per-model tooltip

### 2.4 Apply AI edits to editor ✅

- ✅ Monaco diff editor for AI proposals (inline diff)
- ✅ Preview pane shows proposed SVG
- ✅ Accept/reject in chat

### 2.5 Streaming UX ⏳

- ✅ Progress indicators (thinking, generating image, vectorizing)
- ⬚ SSE streaming of AI text responses (Azure Functions v4 HTTP streaming needs investigation — `enableHttpStream` + `ReadableStream`/`Readable` didn't work with local func host)

### 2.6 AI Image Generation ✅

- ✅ POST /api/generate-image endpoint (gpt-image-1-mini)
- ✅ Browser-side vectorization via vtracer-webapp (WASM)
- ✅ Chroma key magenta transparency
- ✅ Token cost tracking for image generation

### 2.7 Token Usage Tracking ✅

- ✅ Per-user Firestore storage (usage_tokens/{uid}/daily/{date})
- ✅ GET /api/usage endpoint (read-only)
- ✅ Azure OpenAI pricing table (pricing.ts)
- ✅ Per-message and daily cost display in chat UI

### 2.8 Firebase Auth & Profile ✅

- ✅ Google sign-in with anonymous account linking (linkWithPopup)
- ✅ GitHub sign-in support
- ✅ Profile update after linking (displayName, photoURL)
- ✅ UserMenu component with avatar/dropdown
- ✅ React Router: /, /:fileId, /profile routes
- ✅ Profile page: user info, shared files list with SVG preview thumbnails + file size
- ✅ Delete shared files from profile
- ✅ Share/Save button toggle for new vs existing files

**Deliverable:** Working AI SVG editor with chat, diff preview, 5/day server-enforced limit.

**Claude prompt:** "Add a VS Code Copilot Chat-style AI sidebar to the editsvgcode React app. Create an Azure Function that proxies to Azure OpenAI using the Responses API (client.responses.create) with gpt-4.1-mini. The Function validates Firebase Auth ID tokens (admin.auth().verifyIdToken), enforces 5/day rate limit per UID in Firestore, and has CORS locked to editsvgcode.com. Frontend sends ID token in Authorization header. When AI proposes changes, show Monaco diff editor with accept/reject. Include model selector dropdown."

---

## ⏸️ MEASUREMENT PAUSE (2-3 weeks)

Deploy Phase 2, monitor:

- How many users try the AI feature?
- How many hit the 5/day limit?
- What do they ask for? (Log prompts, anonymized)
- Is AI output quality good enough?

**If signals are good (>10% try, >1% hit limit) → proceed to Phase 3 (Enhanced UX) + Phase 4 (Payments).**

---

## Phase 3: Enhanced UX Features

**Goal:** Make the editor best-in-class — add element tree, exports, optimization, advanced navigation. Reference: [vscode-svg2](https://github.com/lishu/vscode-svg2) (MIT) for feature inspiration and code patterns.

### 3.1 SVG Element Tree

- TreeView.tsx in sidebar tab: collapsible tree of SVG DOM
- Click tree node → highlight in preview + scroll in editor
- Show element type + id + key attributes
- Bidirectional sync: preview ↔ tree ↔ editor
- *Note: Monaco already provides code folding for XML; this adds visual overview + preview integration*
- *Ref: vscode-svg2 DocumentSymbol tree in outline panel*

### 3.2 SVG Optimization (SVGO)

- Install svgo (runs client-side)
- Button in toolbar: "Optimize"
- Show before/after file size
- Use Monaco diff to preview optimization changes
- *Ref: vscode-svg2 "Minify SVG" command (note: they warn SVGO can break SVGs — add undo/diff review)*

### 3.3 Export options

- SVG → PNG (render to canvas, resolution picker)
- SVG → React JSX component
- SVG → Data URI / Base64
- SVG → Copy to clipboard
- Export dropdown in toolbar
- *Ref: vscode-svg2 "Export PNG" feature*

### 3.4 Go to id definition / references

- Ctrl+click on `url(#id)` → jump to the element with that `id`
- Ctrl+click on `href="#id"` or `xlink:href="#id"` → same
- Hover on `url(#id)` → show target element preview
- *Ref: vscode-svg2 "In Id Reference Click Goto id="" element"*

### 3.5 Rename id references

- Place cursor on `id="foo"` → F2 → rename `id` and all `url(#foo)`, `href="#foo"` references
- *Ref: vscode-svg2 "Rename Tag Name or Id Reference"*

### 3.6 Path segment preview highlighting

- Path segment highlighting in preview as cursor moves through d="..." data
- Visual feedback linking editor position to preview geometry

**Deliverable:** Feature-rich free editor that competes with 4-5 separate tools.

---

## Phase 4: Payments & Subscription Management

**Goal:** Monetize with subscriptions via PayProGlobal.

### 4.1 Firebase Auth upgrade ✅ (moved to Phase 2.8)

- ✅ Google + GitHub sign-in (keep anonymous as fallback)
- ✅ User avatar/menu in navbar
- ✅ Link anonymous account to real account (preserve saved documents + usage history)
- *Note: Firebase ID token auth + server-side rate limiting already in place from Phase 2*

### 4.2 User profile & settings (partially done)

- ✅ Profile page: account info, shared files list with preview/size/delete
- BYOL configuration: user picks provider (OpenAI / Anthropic / Google) + enters API key
- BYOL keys stored in localStorage (never sent to your server)
- BYOL requests go direct from browser to AI provider (skip Azure Function)
- Model selector in AI sidebar reflects available models per provider
- Subscription status display

### 4.3 PayProGlobal integration

- Create PPG products:
  - **Pro Monthly** ($9/mo subscription)
  - **Pro Annual** ($79/yr subscription)
  - **100 AI Credits** ($5 one-time)
  - **300 AI Credits** ($12 one-time)
  - **1,000 AI Credits** ($29 one-time)
- "Upgrade to Pro" button → redirects to PayProGlobal checkout (pass Firebase UID as custom field)
- "Buy Credits" button → redirects to PPG checkout for credit pack
- Azure Function: POST /api/webhook/payproglobal
  - Verify IPN HASH + SIGNATURE
  - Whitelist PPG IPs (198.199.123.239, 157.230.8.40)
  - On `OrderCharged` (subscription): write to Firestore `users/{uid}` with tier=pro, subscription dates
  - On `OrderCharged` (credit pack): increment `users/{uid}.credits` by pack amount
  - On `SubscriptionChargeSucceed`: renew subscription, reset monthly credit allocation
  - On `SubscriptionSuspended`/`SubscriptionTerminated`: downgrade to free tier
  - On `OrderRefunded`: deduct credits or downgrade tier
- Client reads subscription status + credit balance from Firestore on load

### 4.4 Credit system & tier enforcement

- Firestore `users/{uid}` document:
  ```
  { tier: "free"|"pro", credits: 50, creditsResetDate: "2026-05-01",
    subscriptionId: "...", subscriptionStatus: "active"|"suspended"|... }
  ```
- Server-side model config: `MODEL_CONFIG: Record<string, { credits: number, tier: "free"|"pro" }>`
  - Maps each model to its credit cost and minimum tier
  - Unknown/disallowed models rejected with 400
- Azure Function: before processing AI request:
  1. Read user tier + credit balance
  2. Validate requested model is allowed for user's tier
  3. Check credits >= model's credit cost → if not, return 402 (Payment Required)
  4. Process request, then deduct model's credit cost
- Free: 50 credits/month (reset on calendar month), access to mini models + gpt-image-1-mini
- Pro: 500 credits/month (reset on billing cycle) + all models + can buy top-up packs
- BYOL: client-side calls, no server enforcement
- Remove ads for Pro users

### 4.5 Usage dashboard

- Counter in AI sidebar: "3/5 free edits today" or "Pro ∞"
- Settings page: monthly usage stats

**Deliverable:** Working subscription system with BYOL support.

**Claude prompt:** "Add user authentication (Firebase Auth with Google + email), PayProGlobal subscription integration (webhook to Azure Function, subscription status in Firestore), BYOL support (user picks LLM provider + enters API key, stored in localStorage, calls go direct to provider), and tier enforcement to editsvgcode."

---

## Phase 5: Growth Features

**Goal:** Drive more traffic and increase retention.

### 5.1 SVG search & import

- Azure Function: GET /api/search?q=shopping+cart
- Aggregates: SVG Repo API, Lucide GitHub, Material Icons API
- Returns: thumbnails, license info, SVG content URLs
- Chat UI: grid of results, license badges, "Use" button
- Import: loads SVG into editor with license comment
- License filter: only show MIT/CC0/Apache/CC-BY results

### 5.2 AI SVG generation ✅ (moved to Phase 2.6)

- ✅ Image generation via gpt-image-1-mini
- ✅ Browser-side vectorization to SVG

### 5.3 SEO & marketing pages

- /tools/svg-to-react — landing page for React conversion
- /tools/svg-optimizer — landing page for SVGO
- /tools/svg-icons — landing page for icon search
- Meta tags, Open Graph, structured data

### 5.4 PWA support

- Service worker for offline basic editing
- Install prompt

**Deliverable:** Full-featured SVG platform with multiple traffic entry points.

---

## Timeline

```text
Phase 0: React rewrite              ✅ COMPLETE
Phase 1: Enhanced UX (core)         ✅ COMPLETE
Phase 2: AI sidebar MVP             ✅ COMPLETE (incl. image gen, auth, profile)
  → DEPLOY & MEASURE 2-3 WEEKS
Phase 3: Enhanced UX (advanced)     tree, exports, SVGO, id navigation
Phase 4: Payments                   subscriptions, BYOL, tiers
Phase 5: Growth                     search, SEO, PWA
```

## Manual Steps (Not Claude's Job)

- [x] Create Azure OpenAI resource + deploy GPT-4.1 models
- [x] Create Azure Function App in Azure Portal
- [x] Enable Firebase Auth providers (Google, GitHub) in Firebase Console
- [ ] Create PayProGlobal account + products (Pro Monthly, Pro Annual, credit packs x3)
- [ ] Configure PPG webhook URL + IPN secret key
- [ ] Monitor analytics after Phase 2 launch
- [ ] Product Hunt / Hacker News launch post

# MCP server — plan

Let Claude (claude.ai, Claude Desktop, Claude Code) and other MCP clients edit drawings in a
user's editsvgcode account. Branch: `claude/problem-analysis-dj8d63`.

## Idea

The client's model is the AI; editsvgcode supplies the **editing tools** and the **document**.
No LLM call and no credits on our side. A drawing Claude edits is an ordinary `files/{id}`
document, so the user opens `editsvgcode.com/{id}` to watch it, fine-tune it by hand, export
or publish it.

## Shape

- **Where:** a Firebase Cloud Function, `functions/` in this repo (codebase `mcp`), served at
  `editsvgcode.com/mcp` through a Hosting rewrite. Streamable HTTP, stateless (each request
  stands alone), JSON responses. Firebase is where the backend is heading (the Azure API is to
  follow later), and a function in the project reaches Firestore without keys.
- **No copied code:** `functions/` imports the editor's own `src/lib/svg-ai.ts` and friends;
  esbuild bundles them into `functions/lib/index.js` at deploy. One edit-call planner,
  `planEditCall` in `svg-ai.ts`, serves the editor's chat and MCP alike, so a refusal rule
  added for one reaches the other.
- **Tools:** `create_document`, `open_document`, `list_documents` (with the picker),
  `upload_document`, `show_document`, `generate_image`; read: `read_svg_lines`,
  `search_svg`, `query`, `list_path_parts`; edit: `set_attribute`, `set_text`,
  `set_style_rule`, `insert_element`, `remove_element`, `split_path`, `replace_lines`,
  `replace_svg` (`functions/src/tools.ts`). Descriptions are written for MCP; the chat's own
  prompts stay private in the API.
- **Each edit call** = one Firestore transaction: read, plan, apply, validate, write. An edit
  that would break a well-formed document is refused, not saved (there is no proposal card for
  a person to reject). Documents are capped at 900,000 UTF-8 bytes; an edit that shrinks one is
  always allowed.
- **Access:** edit your own documents, and legacy files with no owner (as `firestore.rules`
  allows); read your own plus unlisted/public ones; someone else's private document reads as
  missing. Checked inside the edit's transaction.

## Working on it

```sh
cd functions
npm install        # .npmrc sets legacy-peer-deps: npm 10 crashes on vitest's jsdom peer
npm test           # MCP tests, through a real MCP client
npm run build      # typecheck + bundle to lib/index.js and the widget to lib/widget.html
node scripts/widget-preview.mjs [drawing.svg]   # lib/widget-preview.html: the widget in a stand-in host
```

Locally, `npm run dev` builds the function and runs it in the functions emulator with the
rest; Vite forwards `/mcp`, `/oauth/*` and `/.well-known/oauth-*` to it, so the MCP server is at
`http://localhost:3000/mcp` and `/connect` signs in through the Auth emulator — one origin, as
Hosting gives it in production. After changing `functions/src`, `npm --prefix functions run
build`; the emulator reloads `functions/lib`. To try it from Claude Code:
`claude mcp add --transport http editsvgcode-local http://localhost:3000/mcp`, then `/mcp` to
sign in. Deploy to beta with `npm run deploy:mcp:beta` — and only with the user's go-ahead (CLAUDE.md).

**Deploy order once this is merged:** deploy the function (`deploy:mcp`) before the next
`npm run deploy`; Hosting can refuse a rewrite to a function that does not exist yet, and
`/mcp` would fail until it does.
Functions need the Blaze plan. The `/connect` page ships with the editor (hosting deploy).
The region (`us-central1`, in `functions/src/index.ts` and the
rewrite in `firebase.json`) should match the Firestore database's location.

## Steps

1. **Server + tools** — done. Checked end to end in the emulators: create, edit in a
   transaction, read back, list.
2. **OAuth 2.1** — done (`functions/src/oauth.ts`, consent page `src/pages/ConnectPage.tsx`).
   A 401 points at protected-resource metadata (RFC 9728); authorization-server metadata
   (RFC 8414) at `/.well-known/oauth-authorization-server`; open dynamic client registration
   (RFC 7591, public clients, https or loopback redirects); `/oauth/authorize` → the editor's
   `/connect` page, where the user signs in with their editsvgcode account and allows or
   denies; `/oauth/token` with PKCE (S256 only) and rotating refresh tokens. Access tokens last
   an hour, refresh tokens 30 days. Codes and tokens are stored hashed in Firestore
   (`mcpOAuth*` collections, closed to browsers by the rules); a replayed code or refresh token
   revokes the whole grant. `/connect` cannot be framed, and approvals are accepted only from
   the editor's origin. MCP takes only these access tokens — not Firebase ID tokens. Checked
   end to end with the MCP SDK's own OAuth client against the emulators.

   **To connect** once deployed: in Claude, Settings → Connectors → Add custom connector, URL
   `https://<site>/mcp`; Claude opens `/connect` to sign in.

   **Before the first deploy:** set a Firestore TTL policy on `expiresAt` for the four
   `mcpOAuth*` collections (Console → Firestore → TTL), or expired records pile up. Production
   pins its address in `functions/.env.editsvgcode-db`, beta in `functions/.env.editsvgcode-beta`
   (the firebaseapp.com address: Google sign-in on `/connect` fails on web.app).
3. **The drawing in the chat (MCP App)** — first version done: without it the user cannot see
   what the model edits. `show_document` carries `_meta.ui.resourceUri` →
   `ui://editsvgcode/preview-<hash>.html`, which hosts that render MCP Apps (Claude, ChatGPT) load into
   a sandboxed iframe. The page is the editor's own `Preview` (`src/mcp-widget/main.tsx`),
   bundled by `functions/scripts/build.mjs` into one self-contained HTML (~1 MB, mostly zod
   from the MCP SDK and Mantine's CSS). The tool result names only the document; the page
   fetches the markup through `get_document_svg`, which is app-only (`visibility: ["app"]`), so
   the SVG does not pass through the model again. Header: title, Refresh, Open in EditSvgCode,
   full screen. No PNG fallback for hosts without widgets: they get the editor link. Modelled on
   VisPlan's plan viewer (VistoTeams `src/client/mcpApp`). Next: select and move/resize in the
   widget, written back through the edit tools and reported to the model
   (`updateModelContext`) so its line numbers do not go stale.

   Learned on beta (2026-10-14): hosts cache a `ui://` page by its URI, so each page's address
   carries a hash of its content (set by the build). In claude.ai the model loads connector
   tools by search and reaches for `list_documents` when it looks for files — it rarely found
   `upload_document`, and asked for an attachment instead, which it then had to retype
   (~4 min for 37 KB). So `list_documents` shows a picker: the user's drawings to click and a
   box to drop an SVG file into, saved by the widget with `create_document`. What the user
   chose reaches the model through `updateModelContext` (a `ui/message` lands in claude.ai's
   input box under a warning about untrusted prompts). MCP prompts ("starters") were tried and
   dropped: claude.ai attaches them as text files, and they did not steer the model.
3b. **Pictures (`generate_image`)** — first version built, not yet on beta. Charges the user's
   credits as the editor's chat does; the model's own edits stay free. The tool only shows a
   card (a second widget, `picture-<hash>.html`, `src/mcp-widget/picture.tsx`): prompt, style
   (outlines/detail), price. Nothing is made or charged until the user presses Generate. The
   widget asks for a one-time link (`picture_link`, app-only) and fetches the PNG from the
   function's own address (`…cloudfunctions.net/mcp/picture/<token>`, declared in the page's
   CSP `connectDomains`), so the picture never passes through the chat. Behind the link the
   function calls the API's `generate-image` as the user with an ID token it mints (custom
   token → Identity Toolkit), so the API's credit check, charge, Pro gate and 402 apply
   unchanged. Links are single-use, expire in 5 minutes, and only their hashes are stored
   (`mcpPictureTickets`; add a TTL policy on `expiresAt`). The widget traces with the editor's
   vtracer (`src/lib/trace.ts`, inlined by the build), saves a new drawing, tells the model
   its id, and shows the editor's tracing sliders (`TraceControls`), which retrace and save
   again. Chats that show no widgets (VS Code, Claude Code) get the editor instead: the results
   carry `editsvgcode.com/?generate=<prompt>` or `/<id>?modify=<change>`, which open the editor's
   own picture card (prompt editable there), charged the same way. Every structured result also
   carries its text as `message`: Claude Code hands the model only the structured content.
   Rejected: handing the widget a Firebase ID token (an hour of full access to the
   user's account, passing through the chat host, and the API would have to admit the
   sandbox's origin).

   **Setup per project:** `API_URL` and `WEB_API_KEY` (not FIREBASE_…: Firebase reserves that prefix) in `functions/.env.<project>`
   (as `config/config.<env>.js`); the function's service account needs
   `roles/iam.serviceAccountTokenCreator` on itself to sign the custom token. Next:
   `modify_image` (the widget renders the drawing to PNG and sends it up the same way), and
   export (SVG/PNG/icons) in the preview.
4. **Live view in the editor** — `onSnapshot` on the open `files/{id}` so Claude's edits appear
   as they land (and go on the undo stack); hold remote updates while the user is typing.
5. **The model seeing the drawing** — `get_png_image` and `get_element_bounds` via `@resvg/resvg-js`
   (the browser versions use canvas and getBBox), returned as MCP image content.
6. **Icons** — `search_icons` without the picker: return the top matches for the model to choose.
7. **Listing** — submit to the claude.ai connector directory; mention it in `llms.txt` and a
   feature page.
8. **Move the Azure API to Firebase** — a second, private functions codebase in the same
   project, so there is one backend again.

## Open questions

- Concurrent edits from the browser and Claude: each MCP edit is atomic, but the editor's Save
  writes its whole text over whatever is stored; step 4 should surface it.
- Rate limits / abuse: client registration and authorization requests are open to anyone and
  each writes a record (bounded in size, expiring). Per-IP / per-uid limits would help;
  `maxInstances: 10` caps the bill meanwhile.
- A page listing connected apps, with a revoke button (delete the grant's tokens by `family`).
- Whether hosts allow WebAssembly in widgets (the picture widget traces with vtracer): a CSP
  without `wasm-unsafe-eval` would stop it; the beta test will show.

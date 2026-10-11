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
- **Tools:** `create_document`, `open_document`, `list_documents`; read: `read_svg_lines`,
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

```
cd functions
npm install        # .npmrc sets legacy-peer-deps: npm 10 crashes on vitest's jsdom peer
npm test           # MCP tests, through a real MCP client
npm run build      # typecheck + bundle to lib/index.js
```

Locally, `firebase emulators:start --only functions,firestore,auth,hosting` serves it at
`http://127.0.0.1:5001/<project>/us-central1/mcp` (and `:5000/mcp` through Hosting). Deploy
with `npm run deploy:mcp` (`:beta` for the beta project).

**Deploy order once this is merged:** deploy the function (`deploy:mcp`) before the next
`npm run deploy`; Hosting can refuse a rewrite to a function that does not exist yet, and
`/mcp` would fail until it does.
Functions need the Blaze plan. The region (`us-central1`, in `functions/src/index.ts` and the
rewrite in `firebase.json`) should match the Firestore database's location.

## Steps

1. **Server + tools** — done. Auth is a Firebase ID token for now (MCP Inspector, testing).
   Checked end to end in the emulators: sign-in, create, edit in a transaction, read back, list.
2. **OAuth 2.1** — what claude.ai custom connectors need: protected-resource metadata
   (`WWW-Authenticate: Bearer resource_metadata=…`), authorization-server metadata at
   `editsvgcode.com/.well-known/oauth-authorization-server` (another Hosting rewrite), dynamic
   client registration, `/authorize` → an editor page (`/connect`) that signs in with Firebase
   and approves, `/token` with PKCE and refresh tokens. Clients, codes and token hashes in
   Firestore; access tokens resolve to the Firebase `uid`.
3. **Live view in the editor** — `onSnapshot` on the open `files/{id}` so Claude's edits appear
   as they land (and go on the undo stack); hold remote updates while the user is typing.
4. **Seeing the drawing** — `get_png_image` and `get_element_bounds` via `@resvg/resvg-js`
   (the browser versions use canvas and getBBox), returned as MCP image content.
5. **Icons** — `search_icons` without the picker: return the top matches for the model to choose.
6. **Listing** — submit to the claude.ai connector directory; mention it in `llms.txt` and a
   feature page.
7. **Move the Azure API to Firebase** — a second, private functions codebase in the same
   project, so there is one backend again.

## Open questions

- Concurrent edits from the browser and Claude: each MCP edit is atomic, but the editor's Save
  writes its whole text over whatever is stored; step 3 should surface it.
- Rate limits / abuse: per-uid limits; `maxInstances: 10` caps the bill meanwhile.
- Image generation via MCP would spend credits — keep it out until the rest is proven.

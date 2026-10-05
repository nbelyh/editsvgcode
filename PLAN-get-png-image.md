# get_png_image — plan

Let the chat model look at the drawing it is editing. Status: designed, reviewed against the code and against VSU's
`get_page_image` (2026-10-04), not started.

## Goal

Models fail most on traced art because they cannot tell which anonymous `<path>` is "the hat" or "the coat".
A read-only tool that renders the current drawing to a PNG, and can highlight what a selector matches, lets the
model check its target before it edits.

## Evidence (2026-10-04 tests)

The full results are in the comparison page: <https://claude.ai/artifact/BfgZXNzksVW1j7xiTWyKvU>.
The design memo is at <https://claude.ai/code/artifact/aee20391-0003-4bba-b61f-02dc0ae2e265>.

- **Same failure on every model.**
  - "Make the coat dark green": gpt-5.4-mini, qwen3.8-27b and qwen3.8-flash all recoloured the dark fur and outlines instead.
  - "Make only the hat red": no model got it fully right, and Qwen took 200–513 s searching.
- **Drawn additions land in the wrong place, or crude.** Examples: a scarf in the magnifying glass, a crude band at the neck.
- **Attaching one PNG up front made Qwen fast but not reliably right.** Seeing the picture is not enough when the
  model still cannot connect a path to what it sees. Hence the highlight.
- **The image tool (`modify_image`) found the coat and the hat at once,** but it redraws the whole picture, so other
  parts drift.

## Measured facts

- **Both image shapes work** on the Responses API, on every route tested:
  - inside `function_call_output.output` as `[{type:'input_text'}, {type:'input_image', image_url:'data:image/png;base64,…'}]`;
  - as a separate user message after a text-only output.
  - gpt-5.4-mini on Azure, api-version 2025-04-01-preview: whole request ~800 input tokens.
  - qwen3.8-27b and qwen3.8-flash on OpenRouter, with `provider.data_collection: "deny"`: ~1,400.
- **Untested routes:**
  - DeepSeek-V4-Flash and Kimi-K2.6 (Azure Foundry, third-party).
  - The Claude route. It needs the conversion below first.

## Prior art: VSU's `get_page_image`

The Visio sidebar already ships the same tool. What it settled, with the files:

- **The image rides as its own user item, not inside the tool result.** The `function_call_output` stays a string
  ("what was rendered"), and after all of a round's outputs comes `{role:'user', content:[{type:'input_text', text:
  caption}, {type:'input_image', image_url}]}`. `VSU/VSU/Sidebar/Llm/AssistantLoop.cs:340-375`.
- **Claude conversion exists.** `vsu-ai-api/src/anthropic.ts` `imagesOf` (lines 73–112) turns `input_image` data URLs
  into Anthropic `image` blocks, skips non-`data:` URLs, and keeps the caption; the images go after the round's
  `tool_result` run, which Anthropic requires to be contiguous. Tests in `vsu-ai-api/src/__tests__/anthropic.test.ts`.
  Our `editsvgcode-api/src/anthropic.ts` is the same file before that change.
- **A `Vision` flag per model, default true** (`LlmModels.cs:22-34`); the tool is withheld where it is false
  (`ToolCatalog.cs:25-31`). A blind model is also told it cannot see, in the per-turn context so the cached prefix
  is unchanged (`visio-mcp/src/VisioAI.Tools/AssistantPrompt.cs:28-45`).
- **Pictures are pruned before every round, not at turn end** (`AssistantSession.cs:350-420`): superseded ones, and
  ones taken before a write. Each removal leaves a note whose wording matches the reason ("[Image removed: …]"),
  because the model acts on it — "the drawing changed" makes it look again, "too large" should not.
- **Size.** 1500 px measured 219 KB PNG / 293 KB base64, re-sent on each round; they capped at 1000 px. "Detail on a
  big drawing is a cropping problem, not a resolution one" (`PageImageTools.cs`).
- **Budget counts a picture at a flat ~6,000 chars,** not its base64 length (`AssistantSession.cs:595-630`).
  Otherwise one picture evicts everything else and survives itself.
- **Prompt lines worth copying** (`ToolCatalog.cs:56`, `AssistantPrompt.cs:97-110`): the picture answers how it LOOKS,
  never structure; it is the most expensive read; an earlier image shows the drawing as it WAS.

## Decisions (2026-10-04)

- **Image shape: VSU's.** Text-only `function_call_output`, the picture as a following user item. Keeps
  `anthropic.ts`'s string conversion of outputs correct, needs no `capToolResult` bypass, and keeping the picture out of
  saved history is dropping one item instead of rewriting an output.
- **Rollout: deploy the app first, then the API.** No client-capability flag. An app that does not know the tool
  ends the turn with nothing done (the safety net at `api-client.ts:704` answers it "Not executed"), so the API must
  not offer the tool until the app that handles it is live.
- ~~One highlight colour.~~ **Up to four addresses per look, one outline colour each** (magenta, cyan, green, blue;
  2026-10-05), so candidates are compared in one picture instead of one look each. The text names each colour's
  address, box, and the line and `style`/`fill` of every element it outlined.
- **No cost wording in the prompt.** Measured on gpt-5.4-mini with the traced cat: +82 tokens at 256 px, +313 at 512,
  +697 at 1024, against ~10,200 for the drawing's text. What a look costs is the extra round, not the picture, and
  calling it "the most expensive read" discouraged the highlight that prevents the failure.
- **Line addresses in every tool** (2026-10-05): "line 9" names the one element whose start tag begins on line 9 of
  the document as shown this turn (`lineAddressToPath`, `svg-dom.ts`). Live runs showed the model turning the
  context's line numbers into positional paths — the eighth path, on line 9, became `path[9]` — and editing the
  neighbour, highlight or not. A line holding several elements, or none, is refused with the positional paths to use.
  Live cat test: 3 of 6 before, 6 of 6 after, with 3–6 calls per turn instead of up to 17.
- **No cap on looks per turn** beyond `MAX_TOOL_ROUNDS = 10` (`api-client.ts:92`).
- **Drop old pictures before every round,** VSU's lesson: each continuation re-sends everything. Keep the latest two
  pictures in full; replace each older one with a text item, e.g. "[Image removed: a newer look follows. Call
  get_png_image again if you need this one.]". The tool's text output for that look stays, so the model still knows
  what it looked at.
- **Pictures go only to multimodal models, as images.** Text-only models are not offered the tool. See the model
  table under API step 3.
- **Ship bar measured on gpt-5.4-mini,** the default. Qwen is set aside.
- **Layout guard (`TODO.md`) after this tool,** separately.

## Earlier design note

API `TODO.md:243-259`, "Seeing the result", assessed 2026-08-05.

- **Prefer `render(selector | region)` returning a cropped PNG,** not a whole-canvas snapshot. A 2000×1600 diagram
  with small labels reduces to grey mush at any affordable resolution.

## Tool design

`get_png_image`. All parameters are optional. With `strict: true`, list each one in `required` and make it nullable;
"use null" follows the pattern of `query.limit`.

| Parameter | Type | Behaviour |
| --- | --- | --- |
| `highlight` | CSS selector or positional path, or null | Outlines the matched elements in one bright colour and dims everything else. The text part of the result says how many matched and their combined bounding box. No match returns the usual no-match message (`describeNoMatch`, `svg-dom.ts`) and no image. |
| `crop` | `[x, y, width, height]` in viewBox units, or null | Renders only that region by rewriting the viewBox, so it stays crisp. Scales UP to `size` — the point of zooming in. Default: the whole drawing. |
| `size` | 256, 512 or 1024, or null | Longest side in px. Default 512. |

The tool's text output is one line: size, match count and combined box, crop. The picture follows as a user item whose
caption repeats that line, so the model can tell several looks apart.

**Rendering the highlight** (the plan had no method; dimming a group also dims a match inside it):

1. Draw the whole drawing faded (e.g. 25% over white).
2. Render a second copy showing only the matches: inject `* { visibility: hidden !important }` and
   `[data-hl], [data-hl] * { visibility: visible !important }`, mark matches with `data-hl`.
3. Stamp that copy in the highlight colour at a few px offsets around it (a cheap dilation = outline), then draw it at
   full strength on top.
4. The combined box needs browser measurement: factor the numeric part out of `getElementBounds`
   (`src/lib/svg-bounds.ts`) so both tools share it.

Transparent drawings go on white; the text says so, since white parts would vanish. Check `detail` on `input_image`:
1024 px is wasted if the route reads it at `low`.

The prompt needs a short rule for traced art and other drawings with anonymous shapes. Before recolouring, splitting
or deleting part of one, confirm the target with a highlight. The rule does not apply to text and named elements.

## Where the code goes

Line numbers are as of 2026-10-04.

### API (`editsvgcode-api`)

1. `src/prompts.ts`
   - Add the tool after `get_element_bounds` (613–630), which is the model to copy.
   - Update these prompt passages:
     - line 26: intent 3, recolouring part of a path
     - lines 77–91: traced images
     - line 100: "You cannot see the picture…"
     - lines 129–132: read tools
2. `src/anthropic.ts`
   - Port `imagesOf` from `vsu-ai-api/src/anthropic.ts` and its tests; call it before `textOf` (52–61), which today
     drops `input_image` parts.
   - Outputs stay strings, so `String(item.output)` (124) and `ResponsesItem.output` (42) need no change.
   - Add cases to `src/__tests__/anthropic.test.ts` (`HISTORY` fixture at lines 4–11): picture after a tool_result,
     several tool_results then a picture, non-data URL skipped.
3. `src/credits.ts` `MODEL_CONFIG` + `src/functions/chat.ts`
   - Add `vision?: false` (default true).
   - `tools: SVG_TOOLS` goes to every model today (chat.ts:192, 200): filter `get_png_image` out where vision is false.
   - Image input per chat model in `MODEL_CONFIG` (checked online 2026-10-04):

     | Model | Images | Source |
     | --- | --- | --- |
     | gpt-4.1-mini, gpt-5-mini, gpt-5.4-nano, gpt-5.4-mini, gpt-5.4 | yes | OpenAI model docs; 5.4-mini tested in a tool result |
     | gpt-5.6-luna / terra / sol | yes | OpenAI GPT-5.6 docs: text and image input |
     | qwen3.8-27b, qwen3.8-flash | yes | tested on OpenRouter 2026-10-04 |
     | Kimi-K2.6 | **no** → `vision: false` | the model card lists images; our Foundry deployment rejects them (400) |
     | claude-haiku-4-5, claude-sonnet-5, claude-opus-5 | yes | needs the `imagesOf` port first |
     | DeepSeek-V4-Flash | **no** → `vision: false` | text only; vision is a separate `deepseek-v4-flash-vision-exp` model |

     `gpt-image-*` are image-generation deployments, not chat models; the flag does not apply.
   - Size checks (127–155) run only on a turn's first call. Pictures are never replayed, so they do not reach it.
4. `src/input-profile.ts`: count `input_image` parts separately (and at a flat price, not base64 length) in the
   `chat-usage` log.

### App (`editsvgcode`)

1. **Rendering:** a new module, e.g. `src/lib/svg-snapshot.ts`.
   - Reuse `src/lib/svg-export.ts` (`parseSvg` 60, `intrinsicSize` 81, `sizedMarkup` 143, `renderImage` 212).
     Use `src/lib/svg-raster.ts` only for its pattern: it never upscales and cannot crop.
   - Highlight: resolve with `resolveSelector` (`src/lib/svg-dom.ts:332`) on the cloned XML document. See
     "Rendering the highlight" above.
   - Render the real document (`normalizedSvg`), not the text the model reads: `elideEmbeddedData` replaces embedded
     images with tokens. The read tools already receive the real one.
   - Expose it on `window` in DEV, next to `__test_getElementBounds` (`src/components/Editor.tsx:114-117`), for e2e.
2. **`src/lib/api-client.ts`, `sendChatRequest`:**
   - Add the name to the hard-coded read-tool list (line 407).
   - Add an async branch next to `get_element_bounds` (498–499). The text result goes through the normal path.
   - Collect the round's pictures and append them as user items AFTER all of that round's `toolResults` (517), in the
     continuation input only.
   - **Send the picture, do not keep it.** `allRawOutput` is both the continuation input (521) and the returned
     `rawOutput` (722), which is saved and replayed. Keep pictures in a separate per-turn list that is spliced into
     each continuation and never pushed into `allRawOutput`. The text output already says what was shown.
   - Before each continuation, replace all but the latest two pictures in that list with the "[Image removed: …]" text
     item (see Decisions). Unit-test this as a pure function over the list.
   - Pass the short text `result` to `onToolCall` (505). That string is saved in `readToolCalls`, shown in a `<pre>`
     by `ReadToolCallsBlock` (`src/components/aichat/ChatThread.tsx:441`), and copied into `ai_feedback` notes
     (`ai-feedback.ts:130`).
3. **Defensive stripping** of `input_image` items/parts, in case one ever reaches history:
   - `sanitizeHistory` (`src/lib/chat-sanitize.ts:9-22`)
   - `toStored` (`src/lib/chat-history.ts:92-125`). Firestore documents are limited to 1 MiB, and chats are cloned
     into forks.
4. **Optional:** a session-only thumbnail in `ReadToolCallsBlock`.
5. **Other text that says the model cannot see:** the `list_path_parts` header (`src/lib/path-parts.ts:481`) and
   `EMBEDDED_NOTE` (`src/lib/embedded-data.ts:100`). Review both.

## Rollout

1. App: tool handling, rendering, stripping. Deploy.
2. API: tool definition, prompt, `vision` flag, Claude conversion. Deploy once the app is live.

## Tests

- **API:** `anthropic.test.ts`, picture-after-tool-results conversion (ported from vsu-ai-api).
- **App unit tests:** stripping in `src/lib/__tests__/chat-sanitize.test.ts` and `chat-history-reasoning.test.ts`.
  These run in jsdom, which has no canvas, so rendering cannot be unit-tested.
- **App e2e:**
  - Rendering, next to `e2e/editor/bounding-box.spec.ts`, through the `window` hook.
  - The two-round read-then-edit loop, in `e2e/ai/ai-tools.spec.ts`. Use the pattern at line 668 plus the request
    capture at ~785. Assert that the picture was sent after the outputs and is not in the saved history.
  - A live routing case in `e2e/ai/ai-tools-live.spec.ts` (`npm run e2e:live`, real model, spends credits).
- **Measuring it:** re-run the traced-art requests (coat, hat, scarf, boat) on gpt-5.4-mini through the app's own
  loop, with and without the tool.
  - Ship if, on traced art, it lands at least 3 of 4 on the right part (today 0 of 4).
  - Median time and cost per edit should grow by no more than 50%.

## Open questions

- [x] Confirm with one live call each that Kimi-K2.6 on Foundry and the Claude route (after the port) see the
      picture. **Done 2026-10-05:** every chat model described a test picture correctly after a tool result, except
      Kimi-K2.6, whose Foundry deployment answers 400 "does not support image inputs" — `vision: false`.
- [ ] Tell a blind model it cannot see, VSU-style, or leave the existing "You cannot see the picture" wording to it?

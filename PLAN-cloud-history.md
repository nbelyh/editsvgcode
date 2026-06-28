# Cloud chat history — plan

Persist AI chats server-side and showcase public ones. Branch: `feature/cloud-chats`.

## Goals

1. **Continue where you started** — a chat survives a browser clear and follows the user to another device.
2. **Public gallery / demo** — showcase public chats; others can **clone** one to start from it.

## Guiding facts

- The **SVG editor is the free, account-free top of funnel** (PLAN.md). Only the **AI** is gated (sign-in, credits). Most users never chat — the chat is the monetized minority.
- Real SVG sizes (500-doc sample): **median 2.7 KB, P95 49 KB**; only P99 hits 500 KB+. **Generated PNGs are ~100 KB–1.5 MB.** → SVG is fine inline; only **PNGs** need blob storage.

## Model (one collection)

```
files/{id}                      // THE document. id = stable guid, minted at creation.
  uid, private, saved, title, svg (inline), modified, views, downloads, forkedFrom?
files/{id}/messages/{seq}       // the chat — present only when AI was used; tool-call SVGs inline
  role, content, toolCalls[], pngRef?, selectedIcon?, rawItems?
Storage: files/{id}/png/{n}.png // the ONLY blobs (generated images)
```

- **`chatId == fileId`** — one shared stable id; the chat *is* the document's conversation.
- **SVG inline** everywhere (current + tool-call snapshots). Per-message docs keep each under Firestore's 1 MB limit even for the rare giant. Only **PNGs** go to Storage (owner-write; public-or-owner read).
- **`saved`**: `false` = working draft (chat auto-persisted), `true` = saved/published file. `private` drives gallery + share.

## Behavior

- **Editor (everyone):** unchanged. Free, no account, local draft → Save → `files/{id}` (`saved:true`). The funnel stays untouched.
- **Chat (signed-in AI users):** from the first message, persist to `files/{id}` (`saved:false`) + `messages`. No IndexedDB for chats. URL stays `/` until Save → `/{id}`.
- **Continue after clear (Goal 1):** a **recents list** (the user's `saved:false` + recent docs) reopens them.
- **Rollback:** keep the current snapshot/undo system — snapshots are the inline tool-call SVGs; one chat per file ⇒ linear ⇒ no rework.
- **Gallery (Goal 2):** list `private:false`; **clone** = deep-copy doc + messages + PNGs under a new id you own.

## Steps (each a commit on this branch)

1. **Stable document id** — clean guid from creation, reused on save (no `_local_`, no re-mint); malformed ids cleaned on save; uploads mint a guid (filename kept for download only).
2. **Storage infrastructure** — Storage emulator + bucket + client init + npm scripts + `storage.rules` for `files/{id}/png`.
3. **Firestore rules + index** — `files/{id}/messages` subcollection (owner write, public-or-owner read).
4. **Chat persistence** — `EditSvgCodeDb.loadMessages/saveMessages` (inline SVG, PNG→Storage); auto-persist from first message (`saved:false`).
5. **Wire AiChat** — load/save via the server; create-on-first-message; drop chat IndexedDB.
6. **Recents list** — resume unsaved chats after clear / other device (Goal 1 visible).
7. **Save flips `saved:true`** — my-files filters `saved:true`; URL → `/{id}`.
8. **Gallery + clone** — list public; start-from-this deep-copies (Goal 2).

## Deferred (data doesn't justify yet)

Content-addressed blob externalization for SVG; multi-session per file; cross-device undo-stack sync; server-side blob upload. Add only if real usage demands it (e.g. a P99 giant SVG → externalize just that one).

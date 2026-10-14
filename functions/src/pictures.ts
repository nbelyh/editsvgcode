import { createHash, randomBytes } from "node:crypto";
import { getDb } from "./firebase";

/**
 * Pictures from the image models, charged to the user's credits. The model's tools never make
 * one: generate_image and modify_image only put a card in the chat (the picture widget), and the
 * user presses Generate (or Change) there. For a change, the widget renders the drawing to a PNG
 * and sends it up the same link, in the body of a POST. The widget then asks, through the chat, for a one-time link (picture_link) and
 * fetches the picture from this function directly, so the 1–2 MB PNG never passes through the
 * chat. Behind the link this function calls the editsvgcode API as the user — the API's own
 * credit check and charge apply, as when the editor asks — and streams the PNG back.
 */

/** The image models and their price, as the API's MODEL_CONFIG (editsvgcode-api src/credits.ts)
 *  has them. The API charges and refuses; this is only for the card that asks first. */
export const IMAGE_MODELS: Record<string, { credits: number; pro: boolean }> = {
  "gpt-image-1-mini": { credits: 10, pro: false },
  "gpt-image-1.5": { credits: 30, pro: true },
  "gpt-image-1": { credits: 50, pro: true },
};
export const DEFAULT_IMAGE_MODEL = "gpt-image-1-mini";

/** What a link may make: one picture, for this user, as asked on the card. */
export interface PictureTicket {
  uid: string;
  /** A new picture (GET), or a change to the one sent up (POST, the PNG as the body). */
  kind: "generate" | "modify";
  prompt: string;
  model: string;
  outlines: boolean;
  detail: boolean;
  expiresAt: Date;
}

/** Links last long enough for the widget to use theirs at once, no longer. */
export const TICKET_TTL_MS = 5 * 60_000;

export interface TicketStore {
  put(hash: string, ticket: PictureTicket): Promise<void>;
  /** The ticket, removed so it cannot be used twice; null when there is none. */
  take(hash: string): Promise<PictureTicket | null>;
}

function hashOf(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** A new link token. Only its hash is stored. */
export async function issueTicket(store: TicketStore, ticket: Omit<PictureTicket, "expiresAt">, now = Date.now()): Promise<string> {
  const token = randomBytes(24).toString("base64url");
  await store.put(hashOf(token), { ...ticket, expiresAt: new Date(now + TICKET_TTL_MS) });
  return token;
}

/** What the API's generate-image and modify-image take; `image` (base64 PNG) only for a change. */
export interface ImageRequest {
  kind: "generate" | "modify";
  prompt: string;
  model: string;
  outlines: boolean;
  detail: boolean;
  image?: string;
}

/** Calls the editsvgcode API's image endpoint as the user; the API checks and charges credits. */
export type CallImageApi = (uid: string, request: ImageRequest) => Promise<Response>;

export interface PictureDeps {
  tickets: TicketStore;
  callImageApi: CallImageApi;
  now?: () => number;
}

export interface PictureOut {
  status: number;
  headers: Record<string, string>;
  body: Buffer | string;
}

/** The link is the credential, so any page may use it: the widget's origin is the host's sandbox. */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Expose-Headers": "X-Credits-Remaining, X-Credits-Limit",
};

function json(status: number, value: unknown): PictureOut {
  return { status, headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(value) };
}

/** The most a picture sent up for a change may weigh: a 1024-pixel PNG is 1–2 MB. */
const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * /picture/<token>: the picture the ticket names, made and charged now, once. GET for a new
 * picture; POST with the PNG to change as the body for a change.
 */
export async function handlePicture(method: string, token: string, body: Buffer | undefined, deps: PictureDeps): Promise<PictureOut> {
  if (method === "OPTIONS") return { status: 204, headers: CORS, body: "" };
  if (method !== "GET" && method !== "POST") return json(405, { error: "Method not allowed." });
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return json(404, { error: "This link is not valid." });
  if (method === "POST" && (!body || body.length > MAX_SOURCE_BYTES || !body.subarray(0, 8).equals(PNG_SIGNATURE))) {
    return json(400, { error: "Send the picture to change as a PNG, at most 8 MB." });
  }

  const ticket = await deps.tickets.take(hashOf(token));
  const now = deps.now?.() ?? Date.now();
  if (!ticket || ticket.expiresAt.getTime() < now) {
    return json(410, { error: "This link has expired or was used. Press the button again." });
  }
  // A link is for one kind of request; taken either way, so a wrong call cannot be retried.
  if ((ticket.kind === "modify") !== (method === "POST")) return json(400, { error: "This link is for another kind of picture." });

  const res = await deps.callImageApi(ticket.uid, {
    kind: ticket.kind, prompt: ticket.prompt, model: ticket.model, outlines: ticket.outlines, detail: ticket.detail,
    ...(ticket.kind === "modify" ? { image: body!.toString("base64") } : {}),
  });
  if (!res.ok) {
    // The API's own answer, as the editor gets it: 402 with a code when credits run out.
    const data = await res.json().catch(() => ({ error: `The picture could not be made (${res.status}).` }));
    return json(res.status, data);
  }
  const headers: Record<string, string> = { ...CORS, "Content-Type": "image/png", "Cache-Control": "no-store" };
  for (const h of ["X-Credits-Remaining", "X-Credits-Limit"]) {
    const v = res.headers.get(h);
    if (v !== null) headers[h] = v;
  }
  return { status: 200, headers, body: Buffer.from(await res.arrayBuffer()) };
}

/**
 * The API, called with a Firebase ID token for the user, which this function mints: a custom
 * token from the Admin SDK (the function's service account needs the Service Account Token
 * Creator role on itself to sign it), exchanged for an ID token at the Identity Toolkit. Never
 * leaves this function. Cached per user until shortly before it expires.
 */
export function imageApiAsUser(options: {
  apiUrl: string;
  webApiKey: string;
  createCustomToken: (uid: string) => Promise<string>;
  fetch?: typeof fetch;
}): CallImageApi {
  const doFetch = options.fetch ?? fetch;
  const cache = new Map<string, { idToken: string; until: number }>();
  const emulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const identity = emulator ? `http://${emulator}/identitytoolkit.googleapis.com` : "https://identitytoolkit.googleapis.com";

  async function idTokenFor(uid: string): Promise<string> {
    const hit = cache.get(uid);
    if (hit && hit.until > Date.now()) return hit.idToken;
    const custom = await options.createCustomToken(uid);
    const res = await doFetch(`${identity}/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(options.webApiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: custom, returnSecureToken: true }),
    });
    if (!res.ok) throw new Error(`Sign-in for the image API failed (${res.status}).`);
    const { idToken, expiresIn } = (await res.json()) as { idToken: string; expiresIn: string };
    cache.set(uid, { idToken, until: Date.now() + (Number(expiresIn) - 300) * 1000 });
    return idToken;
  }

  return async (uid, { kind, ...body }) => doFetch(`${options.apiUrl.replace(/\/+$/, "")}/api/${kind}-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await idTokenFor(uid)}` },
    body: JSON.stringify(body),
  });
}

export class MemoryTicketStore implements TicketStore {
  private readonly tickets = new Map<string, PictureTicket>();

  async put(hash: string, ticket: PictureTicket): Promise<void> {
    this.tickets.set(hash, ticket);
  }

  async take(hash: string): Promise<PictureTicket | null> {
    const ticket = this.tickets.get(hash) ?? null;
    this.tickets.delete(hash);
    return ticket;
  }
}

/** mcpPictureTickets/{hash}: closed to browsers (firestore.rules denies what it does not name).
 *  A TTL policy on expiresAt clears the ones never used. */
export class FirestoreTicketStore implements TicketStore {
  async put(hash: string, ticket: PictureTicket): Promise<void> {
    await getDb().collection("mcpPictureTickets").doc(hash).set(ticket);
  }

  async take(hash: string): Promise<PictureTicket | null> {
    const db = getDb();
    const ref = db.collection("mcpPictureTickets").doc(hash);
    return db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return null;
      tx.delete(ref);
      const data = snap.data()!;
      return { ...data, expiresAt: data.expiresAt.toDate() } as PictureTicket;
    });
  }
}

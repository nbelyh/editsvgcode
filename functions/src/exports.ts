import { createHash, randomBytes } from "node:crypto";
import { getDb } from "./firebase";
import type { DocumentStore } from "./documents";

/**
 * export_document: a download link for a drawing, as an SVG file or a PNG. The tools hand the
 * model the drawing to read; this hands over the file itself — for the user to click in a chat,
 * or for a client such as Claude Code to fetch into another program — without the model typing
 * it out again. The link is the credential, so it works without signing in, for a short time.
 */

export type ExportFormat = "svg" | "png";

export interface ExportTicket {
  uid: string;
  documentId: string;
  format: ExportFormat;
  /** A PNG's longest side, in pixels. */
  size: number;
  expiresAt: Date;
}

/** Long enough to click the link or fetch it a few times, not to pass around. */
export const EXPORT_TTL_MS = 15 * 60_000;
export const PNG_SIZES = { default: 1024, min: 16, max: 4096 };

export interface ExportStore {
  put(hash: string, ticket: ExportTicket): Promise<void>;
  /** The ticket, still there after use: a browser may fetch a link twice. */
  get(hash: string): Promise<ExportTicket | null>;
}

const hashOf = (token: string) => createHash("sha256").update(token).digest("hex");

/** A new link token. Only its hash is stored. */
export async function issueExport(store: ExportStore, ticket: Omit<ExportTicket, "expiresAt">, now = Date.now()): Promise<string> {
  const token = randomBytes(24).toString("base64url");
  await store.put(hashOf(token), { ...ticket, expiresAt: new Date(now + EXPORT_TTL_MS) });
  return token;
}

export interface ExportOut {
  status: number;
  headers: Record<string, string>;
  body: Buffer | string;
}

/** A file name from the drawing's title: what a browser saves the download as. */
export function fileName(title: string, id: string, format: ExportFormat): string {
  const base = title.normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || id;
  return `${base}.${format}`;
}

/**
 * /mcp/export/<token>: the drawing as it is now, in the format the link names, while the link
 * lasts and the user it was made for can still open the drawing.
 */
export async function handleExport(
  method: string,
  token: string,
  deps: { exports: ExportStore; documents: DocumentStore; drawPng: (svg: string, size: number) => Buffer; now?: () => number },
): Promise<ExportOut> {
  const plain = (status: number, text: string): ExportOut => ({
    status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }, body: text,
  });
  if (method !== "GET" && method !== "HEAD") return plain(405, "Use GET.");
  const ticket = await deps.exports.get(hashOf(token));
  const now = deps.now?.() ?? Date.now();
  if (!ticket || ticket.expiresAt.getTime() <= now) return plain(404, "This download link has expired. Ask for a new one.");
  const doc = await deps.documents.get(ticket.documentId);
  if (!doc || (doc.uid !== ticket.uid && doc.visibility === "private")) return plain(404, "This drawing is no longer available.");

  const name = fileName(doc.title, doc.id, ticket.format);
  const headers = {
    "Cache-Control": "no-store",
    "Content-Disposition": `attachment; filename="${name}"`,
    "Access-Control-Allow-Origin": "*",
    // Served from the editor's own origin: a script in a drawing must not run there, whatever
    // a browser makes of the attachment.
    "Content-Security-Policy": "sandbox",
    "X-Content-Type-Options": "nosniff",
  };
  const type = ticket.format === "svg" ? "image/svg+xml; charset=utf-8" : "image/png";
  // A HEAD asks only whether the file is there: nothing is drawn for it.
  if (method === "HEAD") return { status: 200, headers: { ...headers, "Content-Type": type }, body: "" };
  if (ticket.format === "svg") {
    return { status: 200, headers: { ...headers, "Content-Type": "image/svg+xml; charset=utf-8" }, body: doc.text };
  }
  let png: Buffer;
  try {
    png = deps.drawPng(doc.text, ticket.size);
  } catch {
    return plain(422, "This drawing could not be drawn as a PNG. Open it in the editor to fix its code.");
  }
  return { status: 200, headers: { ...headers, "Content-Type": "image/png" }, body: png };
}

export class MemoryExportStore implements ExportStore {
  readonly tickets = new Map<string, ExportTicket>();

  async put(hash: string, ticket: ExportTicket): Promise<void> {
    this.tickets.set(hash, ticket);
  }

  async get(hash: string): Promise<ExportTicket | null> {
    return this.tickets.get(hash) ?? null;
  }
}

/**
 * Beside the picture tickets, as export-{hash}: the TTL policy on mcpPictureTickets' expiresAt
 * clears these too, and firestore.rules keeps browsers out of the whole collection.
 */
export class FirestoreExportStore implements ExportStore {
  async put(hash: string, ticket: ExportTicket): Promise<void> {
    await getDb().collection("mcpPictureTickets").doc(`export-${hash}`).set(ticket);
  }

  async get(hash: string): Promise<ExportTicket | null> {
    const snap = await getDb().collection("mcpPictureTickets").doc(`export-${hash}`).get();
    if (!snap.exists) return null;
    const data = snap.data()!;
    return { ...data, expiresAt: data.expiresAt.toDate() } as ExportTicket;
  }
}

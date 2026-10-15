import { randomBytes } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "./firebase";

export type Visibility = "private" | "unlisted" | "public";

export interface StoredDocument {
  id: string;
  text: string;
  uid: string | null;
  visibility: Visibility;
  title: string;
}

export interface DocumentSummary {
  id: string;
  title: string;
  visibility: Visibility;
  modified: Date | null;
}

/**
 * Where MCP documents live. The editor's own `files/{id}` collection in production, so a drawing
 * Claude edits is the one the user opens at editsvgcode.com/{id}; an in-memory map in tests.
 */
export interface DocumentStore {
  get(id: string): Promise<StoredDocument | null>;
  create(uid: string, text: string, title: string): Promise<string>;
  /** Create it under an id chosen beforehand (a picture card's, see server.ts generate_image);
   *  false, writing nothing, when a document already has that id. */
  createAt(id: string, uid: string, text: string, title: string): Promise<boolean>;
  /**
   * Read-modify-write in one transaction, so two edits racing on one document cannot both win.
   * `edit` returns the new text, or null to leave the document as it is.
   */
  update(id: string, edit: (current: StoredDocument) => string | null): Promise<StoredDocument | null>;
  listOwned(uid: string, limit: number): Promise<DocumentSummary[]>;
}

/** The same shape of id the editor mints (getNewUniqueId): lowercase base36. */
export function newDocumentId(): string {
  return BigInt("0x" + randomBytes(8).toString("hex")).toString(36) + Date.now().toString(36);
}

/** Legacy documents carry only the `private` boolean (see firestore.rules `vis`). */
function visibilityOf(data: FirebaseFirestore.DocumentData): Visibility {
  const v = data.visibility;
  if (v === "private" || v === "unlisted" || v === "public") return v;
  return data.private === true ? "private" : "unlisted";
}

function toStored(id: string, data: FirebaseFirestore.DocumentData): StoredDocument {
  return {
    id,
    text: typeof data.text === "string" ? data.text : "",
    uid: typeof data.uid === "string" ? data.uid : null,
    visibility: visibilityOf(data),
    title: typeof data.title === "string" ? data.title : "",
  };
}

export class FirestoreDocumentStore implements DocumentStore {
  private files() {
    return getDb().collection("files");
  }

  async get(id: string): Promise<StoredDocument | null> {
    const snap = await this.files().doc(id).get();
    return snap.exists ? toStored(id, snap.data()!) : null;
  }

  async create(uid: string, text: string, title: string): Promise<string> {
    const id = newDocumentId();
    await this.createAt(id, uid, text, title);
    return id;
  }

  async createAt(id: string, uid: string, text: string, title: string): Promise<boolean> {
    // The fields the editor's own Save writes (firebase.ts saveDocument), as a saved private
    // file: it shows in the user's file list, and only they can open it until they share it.
    try {
      await this.files().doc(id).create({
        uid,
        text,
        title,
        visibility: "private",
        private: true,
        saved: true,
        createdAt: FieldValue.serverTimestamp(),
        modified: FieldValue.serverTimestamp(),
        createdBy: "mcp",
      });
      return true;
    } catch (err) {
      // gRPC ALREADY_EXISTS: create() never overwrites.
      if ((err as { code?: number }).code === 6) return false;
      throw err;
    }
  }

  async update(id: string, edit: (current: StoredDocument) => string | null): Promise<StoredDocument | null> {
    const ref = this.files().doc(id);
    return getDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return null;
      const current = toStored(id, snap.data()!);
      const text = edit(current);
      if (text === null || text === current.text) return current;
      tx.update(ref, { text, modified: FieldValue.serverTimestamp() });
      return { ...current, text };
    });
  }

  async listOwned(uid: string, limit: number): Promise<DocumentSummary[]> {
    // Sorted here rather than with orderBy, which would need a composite index on (uid, modified).
    // Only the listed fields are fetched: a user's files can add up to many megabytes of text.
    const snap = await this.files().where("uid", "==", uid)
      .select("title", "visibility", "private", "modified", "saved").get();
    return snap.docs
      .filter((d) => d.data().saved !== false)
      .map((d) => {
        const data = d.data();
        const modified = data.modified?.toDate?.() ?? null;
        return { id: d.id, title: data.title ?? "", visibility: visibilityOf(data), modified };
      })
      .sort((a, b) => (b.modified?.getTime() ?? 0) - (a.modified?.getTime() ?? 0))
      .slice(0, limit);
  }
}

/** For tests and local runs without Firestore. */
export class MemoryDocumentStore implements DocumentStore {
  readonly docs = new Map<string, StoredDocument & { modified: Date }>();

  async get(id: string): Promise<StoredDocument | null> {
    const d = this.docs.get(id);
    return d ? { id: d.id, text: d.text, uid: d.uid, visibility: d.visibility, title: d.title } : null;
  }

  async create(uid: string, text: string, title: string): Promise<string> {
    const id = newDocumentId();
    await this.createAt(id, uid, text, title);
    return id;
  }

  async createAt(id: string, uid: string, text: string, title: string): Promise<boolean> {
    if (this.docs.has(id)) return false;
    this.docs.set(id, { id, uid, text, title, visibility: "private", modified: new Date() });
    return true;
  }

  async update(id: string, edit: (current: StoredDocument) => string | null): Promise<StoredDocument | null> {
    const current = await this.get(id);
    if (!current) return null;
    const text = edit(current);
    if (text === null || text === current.text) return current;
    this.docs.set(id, { ...current, text, modified: new Date() });
    return { ...current, text };
  }

  async listOwned(uid: string, limit: number): Promise<DocumentSummary[]> {
    return [...this.docs.values()]
      .filter((d) => d.uid === uid)
      .sort((a, b) => b.modified.getTime() - a.modified.getTime())
      .slice(0, limit)
      .map((d) => ({ id: d.id, title: d.title, visibility: d.visibility, modified: d.modified }));
  }
}

import { getDb } from "./firebase";

/**
 * The OAuth server's records, each in its own collection:
 * - `mcpOAuthClients/{clientId}` — registered clients (dynamic client registration)
 * - `mcpOAuthRequests/{id}` — an authorization request waiting on the consent page
 * - `mcpOAuthCodes/{sha256(code)}` — issued authorization codes
 * - `mcpOAuthTokens/{sha256(token)}` — access and refresh tokens
 *
 * Codes and tokens are stored by their hash, so a read of the database yields nothing a client
 * could present. Every record carries `expiresAt`; a Firestore TTL policy on that field deletes
 * the expired ones. firestore.rules deny all of these to browsers.
 *
 * Every grant — one approval on the consent page — has a `family` id that its code and every
 * token descended from it carry, so a replayed code or refresh token can revoke them all.
 */
export type OAuthCollection = "mcpOAuthClients" | "mcpOAuthRequests" | "mcpOAuthCodes" | "mcpOAuthTokens";

export type OAuthRecord = Record<string, unknown> & { expiresAt?: Date; usedAt?: Date; family?: string };

export interface OAuthWrite {
  collection: OAuthCollection;
  id: string;
  record: OAuthRecord;
}

export type ClaimResult =
  | { status: "missing" }
  /** It had been claimed before: a replay. */
  | { status: "reused"; record: OAuthRecord }
  | { status: "claimed"; record: OAuthRecord };

export interface OAuthStore {
  get(collection: OAuthCollection, id: string): Promise<OAuthRecord | null>;
  put(collection: OAuthCollection, id: string, record: OAuthRecord): Promise<void>;
  delete(collection: OAuthCollection, id: string): Promise<void>;
  /**
   * Use a single-use record — a consent request, a code, a refresh token — in one transaction:
   * mark it used and make the writes `decide` returns for it, or none. A record already used is
   * reported as reused and left alone, so the caller can answer the replay.
   */
  claim(collection: OAuthCollection, id: string, at: Date, decide: (record: OAuthRecord) => OAuthWrite[]): Promise<ClaimResult>;
  /** Delete every token of one grant. */
  revokeFamily(family: string): Promise<void>;
}

const DATE_FIELDS = ["expiresAt", "usedAt", "createdAt"] as const;

function fromFirestore(data: FirebaseFirestore.DocumentData): OAuthRecord {
  const record = { ...data } as OAuthRecord;
  for (const f of DATE_FIELDS) {
    const v = data[f] as { toDate?: () => Date } | undefined;
    if (v?.toDate) record[f] = v.toDate();
  }
  return record;
}

export class FirestoreOAuthStore implements OAuthStore {
  async get(collection: OAuthCollection, id: string): Promise<OAuthRecord | null> {
    const snap = await getDb().collection(collection).doc(id).get();
    return snap.exists ? fromFirestore(snap.data()!) : null;
  }

  async put(collection: OAuthCollection, id: string, record: OAuthRecord): Promise<void> {
    await getDb().collection(collection).doc(id).set(record);
  }

  async delete(collection: OAuthCollection, id: string): Promise<void> {
    await getDb().collection(collection).doc(id).delete();
  }

  async claim(collection: OAuthCollection, id: string, at: Date, decide: (record: OAuthRecord) => OAuthWrite[]): Promise<ClaimResult> {
    const db = getDb();
    const ref = db.collection(collection).doc(id);
    return db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return { status: "missing" } as const;
      const record = fromFirestore(snap.data()!);
      if (record.usedAt) return { status: "reused", record } as const;
      tx.update(ref, { usedAt: at });
      for (const w of decide(record)) tx.set(db.collection(w.collection).doc(w.id), w.record);
      return { status: "claimed", record } as const;
    });
  }

  async revokeFamily(family: string): Promise<void> {
    const snap = await getDb().collection("mcpOAuthTokens").where("family", "==", family).get();
    const batch = getDb().batch();
    for (const d of snap.docs) batch.delete(d.ref);
    await batch.commit();
  }
}

export class MemoryOAuthStore implements OAuthStore {
  readonly records = new Map<string, OAuthRecord>();

  async get(collection: OAuthCollection, id: string): Promise<OAuthRecord | null> {
    const r = this.records.get(`${collection}/${id}`);
    return r ? { ...r } : null;
  }

  async put(collection: OAuthCollection, id: string, record: OAuthRecord): Promise<void> {
    this.records.set(`${collection}/${id}`, { ...record });
  }

  async delete(collection: OAuthCollection, id: string): Promise<void> {
    this.records.delete(`${collection}/${id}`);
  }

  async claim(collection: OAuthCollection, id: string, at: Date, decide: (record: OAuthRecord) => OAuthWrite[]): Promise<ClaimResult> {
    const key = `${collection}/${id}`;
    const record = this.records.get(key);
    if (!record) return { status: "missing" };
    if (record.usedAt) return { status: "reused", record: { ...record } };
    const writes = decide({ ...record });
    this.records.set(key, { ...record, usedAt: at });
    for (const w of writes) this.records.set(`${w.collection}/${w.id}`, { ...w.record });
    return { status: "claimed", record: { ...record } };
  }

  async revokeFamily(family: string): Promise<void> {
    for (const [key, r] of this.records) {
      if (key.startsWith("mcpOAuthTokens/") && r.family === family) this.records.delete(key);
    }
  }
}

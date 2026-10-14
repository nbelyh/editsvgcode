import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/** Inside Cloud Functions the project and its credentials come from the environment. */
function app() {
  return getApps()[0] ?? initializeApp();
}

export function getDb() {
  return getFirestore(app());
}

/** The signed-in, non-anonymous user an `Authorization: Bearer <Firebase ID token>` names. */
export async function uidFromFirebaseToken(authorization: string | undefined): Promise<string | null> {
  if (!authorization?.startsWith("Bearer ")) return null;
  try {
    const decoded = await getAuth(app()).verifyIdToken(authorization.slice(7));
    return decoded.firebase?.sign_in_provider === "anonymous" ? null : decoded.uid;
  } catch {
    return null;
  }
}

/** A custom token for the user, to exchange for an ID token (pictures.ts imageApiAsUser). Signing
 *  it needs the Service Account Token Creator role for the function's account on itself. */
export function createCustomToken(uid: string): Promise<string> {
  return getAuth(app()).createCustomToken(uid);
}

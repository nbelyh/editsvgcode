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
  if (!authorization?.startsWith("Bearer ")) {
    console.warn("connect approval: no Firebase token sent");
    return null;
  }
  try {
    const decoded = await getAuth(app()).verifyIdToken(authorization.slice(7));
    if (decoded.firebase?.sign_in_provider === "anonymous") {
      console.warn("connect approval: refused a guest (anonymous) token");
      return null;
    }
    return decoded.uid;
  } catch (err) {
    // Why the page's sign-in did not verify: the reason only, never the token.
    console.warn(`connect approval: token not verified: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

/** A custom token for the user, to exchange for an ID token (pictures.ts imageApiAsUser). Signing
 *  it needs the Service Account Token Creator role for the function's account on itself. */
export function createCustomToken(uid: string): Promise<string> {
  return getAuth(app()).createCustomToken(uid);
}

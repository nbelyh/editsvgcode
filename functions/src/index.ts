import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { FirestoreDocumentStore } from "./documents";
import { createCustomToken, uidFromFirebaseToken } from "./firebase";
import { handleRequest, type Deps } from "./handler";
import { FirestoreOAuthStore } from "./oauth-store";
import { FirestoreTicketStore, imageApiAsUser } from "./pictures";

/**
 * Where the picture widget fetches a picture: this function's own address, not the site's —
 * Hosting rewrites only /mcp, /oauth and /.well-known to it. PICTURE_URL overrides.
 */
function pictureUrl(): string {
  if (process.env.PICTURE_URL) return process.env.PICTURE_URL;
  const project = process.env.GCLOUD_PROJECT;
  return process.env.FUNCTIONS_EMULATOR === "true"
    ? `http://127.0.0.1:5001/${project}/us-central1/mcp/picture`
    : `https://us-central1-${project}.cloudfunctions.net/mcp/picture`;
}

// The editsvgcode API and the site's public Firebase key (functions/.env.<project>, as
// config/config.<env>.js has them). Without both, generate_image says pictures are unavailable.
const apiUrl = process.env.API_URL;
const webApiKey = process.env.FIREBASE_WEB_API_KEY;

const deps: Deps = {
  documents: new FirestoreDocumentStore(),
  oauth: new FirestoreOAuthStore(),
  uidFromFirebaseToken,
  // Both default to the site the request came through (see handler.ts originOf).
  editorUrl: process.env.EDITOR_URL || undefined,
  publicOrigin: process.env.PUBLIC_ORIGIN || undefined,
  pictures: apiUrl && webApiKey
    ? { url: pictureUrl(), tickets: new FirestoreTicketStore(), callImageApi: imageApiAsUser({ apiUrl, webApiKey, createCustomToken }) }
    : undefined,
};

/**
 * The MCP server and its OAuth endpoints, at editsvgcode.com/mcp, /oauth/* and
 * /.well-known/oauth-* through the Hosting rewrites in firebase.json. The region must match them.
 */
export const mcp = onRequest(
  // jsdom parses the documents; 512 MiB leaves room for a large one. maxInstances caps the bill.
  { region: "us-central1", memory: "512MiB", timeoutSeconds: 60, maxInstances: 10 },
  async (req, res) => {
    try {
      await handleRequest(req, res, deps);
    } catch (err) {
      logger.error("request failed", err);
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null });
      }
    }
  },
);

import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { FirestoreDocumentStore } from "./documents";
import { uidFromFirebaseToken } from "./firebase";
import { handleRequest, type Deps } from "./handler";
import { FirestoreOAuthStore } from "./oauth-store";

const deps: Deps = {
  documents: new FirestoreDocumentStore(),
  oauth: new FirestoreOAuthStore(),
  uidFromFirebaseToken,
  // Both default to the site the request came through (see handler.ts originOf).
  editorUrl: process.env.EDITOR_URL || undefined,
  publicOrigin: process.env.PUBLIC_ORIGIN || undefined,
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

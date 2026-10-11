import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { FirestoreDocumentStore } from "./documents";
import { uidFromFirebaseToken } from "./firebase";
import { handleMcp, type McpDeps } from "./handler";

const deps: McpDeps = {
  store: new FirestoreDocumentStore(),
  authenticate: uidFromFirebaseToken,
  editorUrl: (process.env.EDITOR_URL ?? "https://editsvgcode.com").replace(/\/+$/, ""),
};

/**
 * The MCP server, at editsvgcode.com/mcp through the Hosting rewrite in firebase.json.
 * The region must match that rewrite.
 */
export const mcp = onRequest(
  // jsdom parses the documents; 512 MiB leaves room for a large one. maxInstances caps the bill.
  { region: "us-central1", memory: "512MiB", timeoutSeconds: 60, maxInstances: 10 },
  async (req, res) => {
    try {
      await handleMcp(req, res, deps);
    } catch (err) {
      logger.error("mcp request failed", err);
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null });
      }
    }
  },
);

import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./server";
import type { DocumentStore } from "./documents";

export interface McpDeps {
  store: DocumentStore;
  /** The user the request's Authorization header names, or null. */
  authenticate(authorization: string | undefined): Promise<string | null>;
  /** Where a document opens in the editor, without the trailing slash. */
  editorUrl: string;
}

function json(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}): void {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

/**
 * The MCP endpoint: Streamable HTTP, stateless — every request stands alone, so any instance can
 * answer it. `body` is the JSON the hosting framework already parsed.
 *
 * Auth for now is a Firebase ID token, which the MCP Inspector can send. Clients such as
 * claude.ai need OAuth; that is the next step (PLAN-mcp.md).
 */
export async function handleMcp(req: IncomingMessage & { body?: unknown }, res: ServerResponse, deps: McpDeps): Promise<void> {
  // Stateless, so there is no server-to-client stream (GET) and no session to end (DELETE).
  // Answered here: handed to the transport, a GET opens an event stream nothing ever closes.
  if (req.method !== "POST") {
    json(res, 405, { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null }, { Allow: "POST" });
    return;
  }

  const uid = await deps.authenticate(req.headers.authorization);
  if (!uid) {
    json(res, 401, { error: "Sign in with an editsvgcode account to use this server." }, {
      "WWW-Authenticate": 'Bearer error="invalid_token"',
    });
    return;
  }

  const server = createMcpServer({ uid, store: deps.store, editorUrl: deps.editorUrl });
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } finally {
    await server.close();
  }
}

import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./server";
import type { DocumentStore } from "./documents";
import type { OAuthStore } from "./oauth-store";
import { corsHeaders, handleOAuth, resourceMetadataUrl, uidFromAccessToken, type HttpOut, type OAuthConfig } from "./oauth";

export interface Deps {
  documents: DocumentStore;
  oauth: OAuthStore;
  /** The signed-in, non-anonymous user a Firebase ID token names, or null. Only the consent
   *  page's approval takes one; MCP requests need an OAuth access token. */
  uidFromFirebaseToken(authorization: string | undefined): Promise<string | null>;
  /** Where the editor lives: document links and the consent page. Unset: this same site, as
   *  behind the Hosting rewrites, which serve the editor and /mcp from one origin. */
  editorUrl?: string;
  /** This server's origin as clients see it. Unset: worked out from the request. */
  publicOrigin?: string;
  now?: () => number;
}

type Request = IncomingMessage & { body?: unknown; path?: string; query?: Record<string, unknown> };

/**
 * The origin clients reached us at: the OAuth issuer and the MCP resource. PUBLIC_ORIGIN pins it
 * (functions/.env.<project>); unpinned, it is the site Hosting passed on as x-forwarded-host.
 */
function originOf(req: Request, deps: Deps): string {
  if (deps.publicOrigin) return deps.publicOrigin.replace(/\/+$/, "");
  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "").split(",")[0].trim();
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host);
  const proto = String(req.headers["x-forwarded-proto"] ?? (local ? "http" : "https")).split(",")[0].trim();
  return `${proto}://${host}`;
}

function send(res: ServerResponse, out: HttpOut): void {
  const headers = { ...out.headers };
  let body: string | undefined;
  if (out.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(out.json);
  } else if (out.text !== undefined) {
    body = out.text;
  }
  res.writeHead(out.status, headers);
  res.end(body);
}

function queryOf(req: Request): Record<string, string | undefined> {
  const query: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(req.query ?? {})) if (typeof v === "string") query[k] = v;
  return query;
}

/**
 * Everything the function serves: OAuth discovery and endpoints, and the MCP endpoint itself at
 * /mcp. The path is relative to the function, which behind the Hosting rewrites is the site's
 * own path.
 */
export async function handleRequest(req: Request, res: ServerResponse, deps: Deps): Promise<void> {
  const origin = originOf(req, deps);
  const path = req.path ?? new URL(req.url ?? "/", "http://x").pathname;
  const editorUrl = (deps.editorUrl ?? origin).replace(/\/+$/, "");
  const oauthConfig: OAuthConfig = {
    issuer: origin,
    editorUrl,
    store: deps.oauth,
    uidFromFirebaseToken: deps.uidFromFirebaseToken,
    now: deps.now,
  };

  const oauth = await handleOAuth({
    method: req.method ?? "GET",
    path,
    query: queryOf(req),
    headers: { authorization: req.headers.authorization, origin: req.headers.origin },
    body: req.body,
  }, oauthConfig);
  if (oauth) return send(res, oauth);

  if (path !== "/mcp") return send(res, { status: 404, headers: corsHeaders(), json: { error: "Not found." } });
  return handleMcp(req, res, deps, origin, editorUrl);
}

async function handleMcp(req: Request, res: ServerResponse, deps: Deps, origin: string, editorUrl: string): Promise<void> {
  const cors = { ...corsHeaders(), "Access-Control-Expose-Headers": "WWW-Authenticate, Mcp-Session-Id" };
  if (req.method === "OPTIONS") return send(res, { status: 204, headers: cors });
  // Stateless, so there is no server-to-client stream (GET) and no session to end (DELETE).
  // Answered here: handed to the transport, a GET opens an event stream nothing ever closes.
  if (req.method !== "POST") {
    return send(res, { status: 405, headers: { ...cors, Allow: "POST" }, json: { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null } });
  }

  // Only access tokens this server issued for this resource, from /oauth/token. A Firebase ID
  // token is not one: accepting it would skip consent (the MCP spec forbids token passthrough).
  const authorization = req.headers.authorization;
  const uid = await uidFromAccessToken(authorization, { store: deps.oauth, now: deps.now });
  if (!uid) {
    // The resource_metadata pointer is how a client discovers where to sign in (RFC 9728);
    // invalid_token tells one that sent an expired token to refresh rather than start over.
    const challenge = [
      ...(authorization ? ['error="invalid_token"'] : []),
      `resource_metadata="${resourceMetadataUrl(origin)}"`,
      'scope="mcp"',
    ].join(", ");
    return send(res, {
      status: 401,
      headers: { ...cors, "WWW-Authenticate": `Bearer ${challenge}` },
      json: { error: "Sign in with an editsvgcode account to use this server." },
    });
  }

  for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);
  const server = createMcpServer({ uid, store: deps.documents, editorUrl });
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } finally {
    await server.close();
  }
  // The request log has the status but not what was asked, nor the transport's reason.
  if (res.statusCode >= 400) {
    const messages = Array.isArray(req.body) ? req.body : [req.body];
    const methods = messages.map((m) => (m && typeof m === "object" && "method" in m ? String(m.method) : typeof m));
    console.warn(`mcp ${res.statusCode}: ${methods.join(", ")} (protocol ${String(req.headers["mcp-protocol-version"] ?? "none")})`);
  }
}

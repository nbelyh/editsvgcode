import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { OAuthStore, OAuthWrite } from "./oauth-store";

/**
 * The OAuth 2.1 authorization server MCP clients such as claude.ai sign in through, per the MCP
 * authorization spec: protected-resource metadata (RFC 9728), authorization-server metadata
 * (RFC 8414), dynamic client registration (RFC 7591), the authorization-code grant with PKCE
 * (S256 only), and rotating refresh tokens. Clients are public — no client secrets.
 *
 * The user signs in and approves on the editor's /connect page, with the same Firebase account
 * they use there; the code it gets back is bound to that account's uid.
 */

export interface HttpIn {
  method: string;
  /** Path below the function, e.g. "/oauth/token". */
  path: string;
  query: Record<string, string | undefined>;
  /** Only these two are read. */
  headers: { authorization?: string; origin?: string };
  /** JSON or form fields, as the hosting framework parsed them. */
  body: unknown;
}

export interface HttpOut {
  status: number;
  headers?: Record<string, string>;
  json?: unknown;
  text?: string;
}

export interface OAuthConfig {
  /** This server's origin as clients see it, e.g. https://editsvgcode.com. It is the issuer. */
  issuer: string;
  /** Where the consent page lives, e.g. https://editsvgcode.com. */
  editorUrl: string;
  store: OAuthStore;
  /** The signed-in, non-anonymous user a Firebase ID token names (from the consent page). */
  uidFromFirebaseToken(authorization: string | undefined): Promise<string | null>;
  now?: () => number;
}

export const SCOPE = "mcp";
/** A registered client is forgotten a year after it was last used. */
const CLIENT_TTL_S = 365 * 24 * 60 * 60;
const REQUEST_TTL_S = 10 * 60;
const CODE_TTL_S = 5 * 60;
const ACCESS_TTL_S = 60 * 60;
const REFRESH_TTL_S = 30 * 24 * 60 * 60;

const CORS: Record<string, string> = {
  // Bearer tokens only, no cookies, so any origin may call: browser-based MCP clients need it.
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Mcp-Protocol-Version",
  "Access-Control-Max-Age": "86400",
};

export function corsHeaders(): Record<string, string> {
  return { ...CORS };
}

export function resourceUrl(issuer: string): string {
  return `${issuer}/mcp`;
}

/** The resources this server grants: the MCP endpoint, and the site as a whole (RFC 9728 §3). */
function isOurResource(resource: string, issuer: string): boolean {
  const r = resource.replace(/\/+$/, "");
  return r === issuer || r === resourceUrl(issuer);
}

export function resourceMetadataUrl(issuer: string): string {
  return `${issuer}/.well-known/oauth-protected-resource/mcp`;
}

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

function json(status: number, body: unknown, headers: Record<string, string> = {}): HttpOut {
  return { status, headers: { ...CORS, ...headers }, json: body };
}

/** For the consent page's own calls: same-origin, so no CORS headers at all. */
function sameOriginJson(status: number, body: unknown): HttpOut {
  return { status, headers: { "Cache-Control": "no-store" }, json: body };
}

function oauthError(status: number, error: string, description: string): HttpOut {
  return json(status, { error, error_description: description }, { "Cache-Control": "no-store" });
}

function redirect(url: string): HttpOut {
  return { status: 302, headers: { Location: url } };
}

function withParams(base: string, params: Record<string, string | undefined>): string {
  const url = new URL(base);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, v);
  return url.toString();
}

function field(body: unknown, name: string): string | undefined {
  const v = (body as Record<string, unknown> | null)?.[name];
  return typeof v === "string" ? v : undefined;
}

const LOOPBACK = ["localhost", "127.0.0.1", "[::1]"];

/** https anywhere; plain http only back to this machine, for desktop clients (RFC 8252). */
export function isAllowedRedirectUri(uri: string): boolean {
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    return false;
  }
  if (url.hash) return false;
  if (url.protocol === "https:") return true;
  return url.protocol === "http:" && LOOPBACK.includes(url.hostname);
}

/**
 * Is `uri` one the client registered? Exactly, except that an http loopback URI may name any
 * port (RFC 8252 §7.3): a desktop client listens on whichever port is free when it signs in.
 */
export function matchesRegisteredUri(uri: string, registered: string[]): boolean {
  if (registered.includes(uri)) return true;
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" || !LOOPBACK.includes(url.hostname)) return false;
  const portless = (u: URL) => `${u.protocol}//${u.hostname}${u.pathname}${u.search}`;
  return registered.some((r) => {
    try {
      return portless(new URL(r)) === portless(url);
    } catch {
      return false;
    }
  });
}

function expired(record: { expiresAt?: Date }, now: number): boolean {
  return !record.expiresAt || record.expiresAt.getTime() <= now;
}

/** RFC 9728: `resource` is the URL this metadata's own address was derived from. */
function protectedResourceMetadata(cfg: OAuthConfig, resource: string) {
  return {
    resource,
    authorization_servers: [cfg.issuer],
    bearer_methods_supported: ["header"],
    scopes_supported: [SCOPE],
    resource_name: "EditSvgCode",
    resource_documentation: "https://editsvgcode.com",
  };
}

function authorizationServerMetadata(cfg: OAuthConfig) {
  return {
    issuer: cfg.issuer,
    authorization_endpoint: `${cfg.issuer}/oauth/authorize`,
    token_endpoint: `${cfg.issuer}/oauth/token`,
    registration_endpoint: `${cfg.issuer}/oauth/register`,
    scopes_supported: [SCOPE],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported: ["S256"],
    authorization_response_iss_parameter_supported: true,
  };
}

async function register(req: HttpIn, cfg: OAuthConfig): Promise<HttpOut> {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const uris = body.redirect_uris;
  // Bounded, because registration is open to anyone: every client is a stored record.
  if (!Array.isArray(uris) || uris.length === 0 || uris.length > 5 || !uris.every((u) => typeof u === "string" && u.length <= 512)) {
    return oauthError(400, "invalid_redirect_uri", "redirect_uris must list 1 to 5 URIs of at most 512 characters.");
  }
  const bad = (uris as string[]).find((u) => !isAllowedRedirectUri(u));
  if (bad) return oauthError(400, "invalid_redirect_uri", `${bad} is not allowed: use https, or http to localhost.`);
  const name = typeof body.client_name === "string" && body.client_name.trim()
    ? body.client_name.trim().slice(0, 100)
    : "An MCP client";

  const clientId = randomUUID();
  const issuedAt = Math.floor((cfg.now?.() ?? Date.now()) / 1000);
  await cfg.store.put("mcpOAuthClients", clientId, {
    clientName: name,
    redirectUris: uris,
    createdAt: new Date(issuedAt * 1000),
    expiresAt: new Date((issuedAt + CLIENT_TTL_S) * 1000),
  });
  return json(201, {
    client_id: clientId,
    client_id_issued_at: issuedAt,
    client_name: name,
    redirect_uris: uris,
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
  }, { "Cache-Control": "no-store" });
}

function errorPage(message: string): HttpOut {
  return { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" }, text: `Cannot connect: ${message}` };
}

async function authorize(req: HttpIn, cfg: OAuthConfig): Promise<HttpOut> {
  const q = req.query;
  const now = cfg.now?.() ?? Date.now();
  const client = q.client_id ? await cfg.store.get("mcpOAuthClients", q.client_id) : null;
  // Until the client and its redirect URI check out, errors are shown here, never redirected:
  // redirecting to an unchecked URI is how an authorization server becomes an open redirector.
  if (!client || expired(client, now)) return errorPage("unknown client_id. Register the client first.");
  const redirectUri = q.redirect_uri;
  if (!redirectUri || !matchesRegisteredUri(redirectUri, client.redirectUris as string[])) {
    return errorPage("redirect_uri is not one this client registered.");
  }
  const fail = (error: string, description: string) =>
    redirect(withParams(redirectUri, { error, error_description: description, state: q.state, iss: cfg.issuer }));
  if (q.response_type !== "code") return fail("unsupported_response_type", "Only response_type=code is supported.");
  if (!q.code_challenge || q.code_challenge_method !== "S256") {
    return fail("invalid_request", "PKCE is required: send code_challenge with code_challenge_method=S256.");
  }
  if (q.resource && !isOurResource(q.resource, cfg.issuer)) {
    return fail("invalid_target", `This server only grants access to ${resourceUrl(cfg.issuer)}.`);
  }

  const id = randomToken();
  await cfg.store.put("mcpOAuthRequests", id, {
    clientId: q.client_id,
    redirectUri,
    codeChallenge: q.code_challenge,
    state: q.state ?? null,
    expiresAt: new Date(now + REQUEST_TTL_S * 1000),
  });
  return redirect(withParams(`${cfg.editorUrl}/connect`, { request: id }));
}

/** What the consent page shows: who is asking, and where the answer goes. */
async function describeRequest(req: HttpIn, cfg: OAuthConfig): Promise<HttpOut> {
  const now = cfg.now?.() ?? Date.now();
  const pending = req.query.id ? await cfg.store.get("mcpOAuthRequests", req.query.id) : null;
  if (!pending || pending.usedAt || expired(pending, now)) return sameOriginJson(404, { error: EXPIRED_REQUEST });
  const client = await cfg.store.get("mcpOAuthClients", pending.clientId as string);
  return sameOriginJson(200, {
    clientName: client?.clientName ?? "An MCP client",
    redirectHost: new URL(pending.redirectUri as string).host,
  });
}

const EXPIRED_REQUEST = "This request has expired or was already answered. Start connecting again from the app.";

/**
 * The consent page's answer. Only the editor's own page may give it: the browser's Origin header
 * must be the editor's, and the response carries no CORS headers, so no other site's script can
 * turn a signed-in visitor's session into a grant. (The page itself refuses to run in a frame,
 * and Hosting forbids framing it — see firebase.json — so Allow cannot be clickjacked.)
 */
async function approve(req: HttpIn, cfg: OAuthConfig): Promise<HttpOut> {
  const now = cfg.now?.() ?? Date.now();
  if (req.headers.origin !== new URL(cfg.editorUrl).origin) {
    return sameOriginJson(403, { error: "Answer this request on the editsvgcode connect page." });
  }
  const requestId = field(req.body, "request");
  const allow = (req.body as Record<string, unknown> | null)?.approve === true;
  const uid = allow ? await cfg.uidFromFirebaseToken(req.headers.authorization) : null;
  if (allow && !uid) return sameOriginJson(401, { error: "Sign in with an editsvgcode account first." });
  if (!requestId) return sameOriginJson(404, { error: EXPIRED_REQUEST });

  // Claimed, not read: a request is answered once, whichever way.
  const code = randomToken();
  const family = randomUUID();
  const claimed = await cfg.store.claim("mcpOAuthRequests", requestId, new Date(now), (pending) =>
    allow && !expired(pending, now)
      ? [{
          collection: "mcpOAuthCodes",
          id: sha256(code),
          record: {
            uid,
            family,
            clientId: pending.clientId,
            redirectUri: pending.redirectUri,
            codeChallenge: pending.codeChallenge,
            expiresAt: new Date(now + CODE_TTL_S * 1000),
          },
        }]
      : []);
  if (claimed.status !== "claimed" || expired(claimed.record, now)) return sameOriginJson(404, { error: EXPIRED_REQUEST });

  const redirectUri = claimed.record.redirectUri as string;
  const state = (claimed.record.state as string | null) ?? undefined;
  return sameOriginJson(200, {
    redirect: allow
      ? withParams(redirectUri, { code, state, iss: cfg.issuer })
      : withParams(redirectUri, { error: "access_denied", error_description: "The user declined.", state, iss: cfg.issuer }),
  });
}

/** A fresh access and refresh token for one grant, as writes to make with the claim. */
function newTokens(uid: string, clientId: string, family: string, now: number) {
  const access = randomToken();
  const refresh = randomToken();
  const writes: OAuthWrite[] = [
    { collection: "mcpOAuthTokens", id: sha256(access), record: { kind: "access", uid, clientId, family, expiresAt: new Date(now + ACCESS_TTL_S * 1000) } },
    { collection: "mcpOAuthTokens", id: sha256(refresh), record: { kind: "refresh", uid, clientId, family, expiresAt: new Date(now + REFRESH_TTL_S * 1000) } },
  ];
  const response = json(200, {
    access_token: access,
    token_type: "Bearer",
    expires_in: ACCESS_TTL_S,
    refresh_token: refresh,
    scope: SCOPE,
  }, { "Cache-Control": "no-store", Pragma: "no-cache" });
  return { writes, response };
}

/** A client in use is remembered for another year. Best effort: a failure here costs nothing now. */
async function keepClient(clientId: string, cfg: OAuthConfig, now: number): Promise<void> {
  try {
    const client = await cfg.store.get("mcpOAuthClients", clientId);
    if (client) await cfg.store.put("mcpOAuthClients", clientId, { ...client, expiresAt: new Date(now + CLIENT_TTL_S * 1000) });
  } catch {
    // The client expires a year after its last successful extension instead.
  }
}

async function token(req: HttpIn, cfg: OAuthConfig): Promise<HttpOut> {
  const now = cfg.now?.() ?? Date.now();
  const grant = field(req.body, "grant_type");
  const clientId = field(req.body, "client_id");
  if (!clientId) return oauthError(401, "invalid_client", "client_id is required.");

  if (grant === "authorization_code") {
    const code = field(req.body, "code");
    const verifier = field(req.body, "code_verifier");
    if (!code || !verifier) return oauthError(400, "invalid_request", "code and code_verifier are required.");
    if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return oauthError(400, "invalid_request", "code_verifier is malformed.");
    const redirectUri = field(req.body, "redirect_uri");
    const challenge = createHash("sha256").update(verifier).digest("base64url");

    let failure: string | null = null;
    let issued: ReturnType<typeof newTokens> | null = null;
    // Any presentation spends the code, valid or not: a code is tried once.
    const claim = await cfg.store.claim("mcpOAuthCodes", sha256(code), new Date(now), (rec) => {
      if (expired(rec, now)) failure = "The code has expired.";
      else if (rec.clientId !== clientId) failure = "The code was issued to another client.";
      else if (rec.redirectUri !== redirectUri) failure = "redirect_uri does not match the authorization request.";
      else if (rec.codeChallenge !== challenge) failure = "code_verifier does not match the code_challenge.";
      if (failure) return [];
      issued = newTokens(rec.uid as string, clientId, rec.family as string, now);
      return issued.writes;
    });
    if (claim.status === "reused") {
      // A code presented twice was intercepted, or the client is broken; either way the tokens
      // the first presentation got are revoked (OAuth 2.1 §4.1.3).
      await cfg.store.revokeFamily(claim.record.family as string);
      return oauthError(400, "invalid_grant", "The code was already used; the access it granted is revoked.");
    }
    if (claim.status === "missing") return oauthError(400, "invalid_grant", "The code is unknown or expired.");
    if (failure || !issued) return oauthError(400, "invalid_grant", failure ?? "The code is invalid.");
    await keepClient(clientId, cfg, now);
    return (issued as ReturnType<typeof newTokens>).response;
  }

  if (grant === "refresh_token") {
    const refresh = field(req.body, "refresh_token");
    if (!refresh) return oauthError(400, "invalid_request", "refresh_token is required.");

    let failure: string | null = null;
    let issued: ReturnType<typeof newTokens> | null = null;
    // Rotated: the old refresh token is spent in the same transaction that writes the new pair.
    const claim = await cfg.store.claim("mcpOAuthTokens", sha256(refresh), new Date(now), (rec) => {
      if (rec.kind !== "refresh" || expired(rec, now)) failure = "The refresh token is unknown or expired.";
      else if (rec.clientId !== clientId) failure = "The refresh token was issued to another client.";
      if (failure) return [];
      issued = newTokens(rec.uid as string, clientId, rec.family as string, now);
      return issued.writes;
    });
    if (claim.status === "reused") {
      // A spent refresh token presented again means two parties hold this grant (OAuth 2.1
      // §4.3.1): revoke it all, and the legitimate client signs in again.
      if (claim.record.kind === "refresh") await cfg.store.revokeFamily(claim.record.family as string);
      return oauthError(400, "invalid_grant", "The refresh token was already used; the access it granted is revoked.");
    }
    if (claim.status === "missing") return oauthError(400, "invalid_grant", "The refresh token is unknown or expired.");
    if (failure || !issued) return oauthError(400, "invalid_grant", failure ?? "The refresh token is invalid.");
    await keepClient(clientId, cfg, now);
    return (issued as ReturnType<typeof newTokens>).response;
  }

  return oauthError(400, "unsupported_grant_type", "Use authorization_code or refresh_token.");
}

/** The user an OAuth access token was issued to, or null. */
export async function uidFromAccessToken(authorization: string | undefined, cfg: Pick<OAuthConfig, "store" | "now">): Promise<string | null> {
  if (!authorization?.startsWith("Bearer ")) return null;
  const stored = await cfg.store.get("mcpOAuthTokens", sha256(authorization.slice(7)));
  if (!stored || stored.kind !== "access" || stored.usedAt || expired(stored, cfg.now?.() ?? Date.now())) return null;
  return stored.uid as string;
}

/** Answer an OAuth or discovery request, or null when the path is not one of ours. */
export async function handleOAuth(req: HttpIn, cfg: OAuthConfig): Promise<HttpOut | null> {
  const path = req.path.replace(/\/+$/, "") || "/";
  const routes: Record<string, { method: "GET" | "POST"; run: () => Promise<HttpOut> | HttpOut }> = {
    "/.well-known/oauth-protected-resource": { method: "GET", run: () => json(200, protectedResourceMetadata(cfg, cfg.issuer)) },
    "/.well-known/oauth-protected-resource/mcp": { method: "GET", run: () => json(200, protectedResourceMetadata(cfg, resourceUrl(cfg.issuer))) },
    "/.well-known/oauth-authorization-server": { method: "GET", run: () => json(200, authorizationServerMetadata(cfg)) },
    "/oauth/register": { method: "POST", run: () => register(req, cfg) },
    "/oauth/authorize": { method: "GET", run: () => authorize(req, cfg) },
    "/oauth/request": { method: "GET", run: () => describeRequest(req, cfg) },
    "/oauth/approve": { method: "POST", run: () => approve(req, cfg) },
    "/oauth/token": { method: "POST", run: () => token(req, cfg) },
  };
  const route = routes[path];
  if (!route) return null;
  if (req.method === "OPTIONS") return { status: 204, headers: corsHeaders() };
  if (req.method !== route.method) return json(405, { error: "Method not allowed." }, { Allow: route.method });
  return route.run();
}

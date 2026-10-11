import { describe, it, expect, beforeEach } from "vitest";
import { createHash, randomBytes } from "node:crypto";
import { handleOAuth, uidFromAccessToken, isAllowedRedirectUri, matchesRegisteredUri, type HttpIn, type OAuthConfig } from "../oauth";
import { MemoryOAuthStore } from "../oauth-store";

const ISSUER = "https://editsvgcode.com";
const REDIRECT = "https://claude.ai/api/mcp/auth_callback";

let store: MemoryOAuthStore;
let clock: number;
let cfg: OAuthConfig;

beforeEach(() => {
  store = new MemoryOAuthStore();
  clock = Date.UTC(2026, 9, 11);
  cfg = {
    issuer: ISSUER,
    editorUrl: ISSUER,
    store,
    // "Bearer alice-id-token" stands for a valid Firebase ID token of user alice.
    uidFromFirebaseToken: async (h) => (h === "Bearer alice-id-token" ? "alice" : null),
    now: () => clock,
  };
});

function req(method: string, path: string, opts: Partial<HttpIn> = {}): HttpIn {
  return { method, path, query: {}, headers: {}, body: undefined, ...opts };
}

async function call(method: string, path: string, opts: Partial<HttpIn> = {}) {
  const out = await handleOAuth(req(method, path, opts), cfg);
  if (!out) throw new Error(`no route for ${path}`);
  return out;
}

function pkce() {
  const verifier = randomBytes(32).toString("base64url");
  return { verifier, challenge: createHash("sha256").update(verifier).digest("base64url") };
}

async function registerClient(redirectUris = [REDIRECT]): Promise<string> {
  const out = await call("POST", "/oauth/register", { body: { client_name: "Claude", redirect_uris: redirectUris } });
  expect(out.status).toBe(201);
  return (out.json as { client_id: string }).client_id;
}

/** Register, authorize, approve as alice: the code and what it takes to redeem it. */
async function codeFor(clientId?: string) {
  const client = clientId ?? await registerClient();
  const { verifier, challenge } = pkce();
  const auth = await call("GET", "/oauth/authorize", {
    query: {
      response_type: "code", client_id: client, redirect_uri: REDIRECT, state: "xyz",
      code_challenge: challenge, code_challenge_method: "S256", resource: `${ISSUER}/mcp`,
    },
  });
  expect(auth.status).toBe(302);
  const consent = new URL(auth.headers!.Location);
  expect(consent.origin + consent.pathname).toBe(`${ISSUER}/connect`);
  const request = consent.searchParams.get("request")!;
  const approved = await call("POST", "/oauth/approve", {
    headers: { authorization: "Bearer alice-id-token", origin: ISSUER },
    body: { request, approve: true },
  });
  expect(approved.status).toBe(200);
  const back = new URL((approved.json as { redirect: string }).redirect);
  expect(back.origin + back.pathname).toBe(REDIRECT);
  expect(back.searchParams.get("state")).toBe("xyz");
  expect(back.searchParams.get("iss")).toBe(ISSUER);
  return { client, verifier, code: back.searchParams.get("code")! };
}

async function redeem(client: string, code: string, verifier: string, redirectUri = REDIRECT) {
  return call("POST", "/oauth/token", {
    body: { grant_type: "authorization_code", client_id: client, code, code_verifier: verifier, redirect_uri: redirectUri },
  });
}

describe("discovery", () => {
  it("publishes protected-resource and authorization-server metadata", async () => {
    const resource = (await call("GET", "/.well-known/oauth-protected-resource/mcp")).json as Record<string, unknown>;
    expect(resource.resource).toBe(`${ISSUER}/mcp`);
    expect(resource.authorization_servers).toEqual([ISSUER]);
    // RFC 9728: the resource is the URL each metadata address derives from.
    const root = (await call("GET", "/.well-known/oauth-protected-resource")).json as Record<string, unknown>;
    expect(root.resource).toBe(ISSUER);

    const server = (await call("GET", "/.well-known/oauth-authorization-server")).json as Record<string, unknown>;
    expect(server.issuer).toBe(ISSUER);
    expect(server.token_endpoint).toBe(`${ISSUER}/oauth/token`);
    expect(server.registration_endpoint).toBe(`${ISSUER}/oauth/register`);
    expect(server.code_challenge_methods_supported).toEqual(["S256"]);
  });

  it("answers CORS preflights and leaves other paths alone", async () => {
    expect((await call("OPTIONS", "/oauth/token")).status).toBe(204);
    expect(await handleOAuth(req("POST", "/mcp"), cfg)).toBeNull();
  });
});

describe("client registration", () => {
  it("accepts https and loopback redirect URIs only", () => {
    expect(isAllowedRedirectUri(REDIRECT)).toBe(true);
    expect(isAllowedRedirectUri("http://127.0.0.1:33418/callback")).toBe(true);
    expect(isAllowedRedirectUri("http://localhost/cb")).toBe(true);
    expect(isAllowedRedirectUri("http://evil.example/cb")).toBe(false);
    expect(isAllowedRedirectUri("javascript:alert(1)")).toBe(false);
    expect(isAllowedRedirectUri("https://x.example/cb#frag")).toBe(false);
  });

  it("matches a loopback redirect URI on any port, and everything else exactly", () => {
    const registered = ["http://127.0.0.1/callback", REDIRECT];
    expect(matchesRegisteredUri("http://127.0.0.1:53124/callback", registered)).toBe(true);
    expect(matchesRegisteredUri("http://127.0.0.1:53124/other", registered)).toBe(false);
    expect(matchesRegisteredUri(REDIRECT, registered)).toBe(true);
    expect(matchesRegisteredUri("https://claude.ai:8443/api/mcp/auth_callback", registered)).toBe(false);
  });

  it("refuses a registration without valid redirect URIs", async () => {
    expect((await call("POST", "/oauth/register", { body: {} })).status).toBe(400);
    expect((await call("POST", "/oauth/register", { body: { redirect_uris: ["http://evil.example/cb"] } })).status).toBe(400);
  });
});

describe("authorization", () => {
  it("never redirects to a client or URI it cannot vouch for", async () => {
    const { challenge } = pkce();
    const unknown = await call("GET", "/oauth/authorize", {
      query: { response_type: "code", client_id: "nope", redirect_uri: REDIRECT, code_challenge: challenge, code_challenge_method: "S256" },
    });
    expect(unknown.status).toBe(400);

    const client = await registerClient();
    const otherUri = await call("GET", "/oauth/authorize", {
      query: { response_type: "code", client_id: client, redirect_uri: "https://evil.example/cb", code_challenge: challenge, code_challenge_method: "S256" },
    });
    expect(otherUri.status).toBe(400);
  });

  it("requires PKCE with S256", async () => {
    const client = await registerClient();
    const out = await call("GET", "/oauth/authorize", {
      query: { response_type: "code", client_id: client, redirect_uri: REDIRECT, code_challenge: "x", code_challenge_method: "plain" },
    });
    expect(out.status).toBe(302);
    expect(new URL(out.headers!.Location).searchParams.get("error")).toBe("invalid_request");
  });

  it("shows the consent page who is asking, and refuses approval without sign-in", async () => {
    const client = await registerClient();
    const { challenge } = pkce();
    const auth = await call("GET", "/oauth/authorize", {
      query: { response_type: "code", client_id: client, redirect_uri: REDIRECT, code_challenge: challenge, code_challenge_method: "S256" },
    });
    const request = new URL(auth.headers!.Location).searchParams.get("request")!;
    expect((await call("GET", "/oauth/request", { query: { id: request } })).json)
      .toEqual({ clientName: "Claude", redirectHost: "claude.ai" });
    expect((await call("POST", "/oauth/approve", { headers: { origin: ISSUER }, body: { request, approve: true } })).status).toBe(401);
  });

  it("takes an answer only from the editor's own page, and only once", async () => {
    const client = await registerClient();
    const { challenge } = pkce();
    const auth = await call("GET", "/oauth/authorize", {
      query: { response_type: "code", client_id: client, redirect_uri: REDIRECT, code_challenge: challenge, code_challenge_method: "S256" },
    });
    const request = new URL(auth.headers!.Location).searchParams.get("request")!;
    const signedIn = { authorization: "Bearer alice-id-token" };
    const fromElsewhere = await call("POST", "/oauth/approve", { headers: { ...signedIn, origin: "https://evil.example" }, body: { request, approve: true } });
    expect(fromElsewhere.status).toBe(403);
    // No CORS headers: another site's script cannot read the answer either.
    expect(fromElsewhere.headers?.["Access-Control-Allow-Origin"]).toBeUndefined();

    expect((await call("POST", "/oauth/approve", { headers: { ...signedIn, origin: ISSUER }, body: { request, approve: true } })).status).toBe(200);
    expect((await call("POST", "/oauth/approve", { headers: { ...signedIn, origin: ISSUER }, body: { request, approve: true } })).status).toBe(404);
    expect((await call("GET", "/oauth/request", { query: { id: request } })).status).toBe(404);
  });

  it("sends a declined request back as access_denied", async () => {
    const client = await registerClient();
    const { challenge } = pkce();
    const auth = await call("GET", "/oauth/authorize", {
      query: { response_type: "code", client_id: client, redirect_uri: REDIRECT, state: "s", code_challenge: challenge, code_challenge_method: "S256" },
    });
    const request = new URL(auth.headers!.Location).searchParams.get("request")!;
    const out = await call("POST", "/oauth/approve", { headers: { origin: ISSUER }, body: { request, approve: false } });
    const back = new URL((out.json as { redirect: string }).redirect);
    expect(back.searchParams.get("error")).toBe("access_denied");
    expect(back.searchParams.get("state")).toBe("s");
  });

  it("lets a consent request expire", async () => {
    const client = await registerClient();
    const { challenge } = pkce();
    const auth = await call("GET", "/oauth/authorize", {
      query: { response_type: "code", client_id: client, redirect_uri: REDIRECT, code_challenge: challenge, code_challenge_method: "S256" },
    });
    const request = new URL(auth.headers!.Location).searchParams.get("request")!;
    clock += 11 * 60 * 1000;
    const out = await call("POST", "/oauth/approve", { headers: { authorization: "Bearer alice-id-token", origin: ISSUER }, body: { request, approve: true } });
    expect(out.status).toBe(404);
  });
});

describe("tokens", () => {
  it("exchanges a code for tokens that sign MCP requests in as the approving user", async () => {
    const { client, code, verifier } = await codeFor();
    const out = await redeem(client, code, verifier);
    expect(out.status).toBe(200);
    const tokens = out.json as { access_token: string; refresh_token: string; token_type: string };
    expect(tokens.token_type).toBe("Bearer");
    expect(await uidFromAccessToken(`Bearer ${tokens.access_token}`, cfg)).toBe("alice");
    // A refresh token is not an access token.
    expect(await uidFromAccessToken(`Bearer ${tokens.refresh_token}`, cfg)).toBeNull();
  });

  it("redeems a code once, and revokes what it granted when it is presented again", async () => {
    const { client, code, verifier } = await codeFor();
    const first = await redeem(client, code, verifier);
    expect(first.status).toBe(200);
    const { access_token } = first.json as { access_token: string };
    expect(await uidFromAccessToken(`Bearer ${access_token}`, cfg)).toBe("alice");

    expect((await redeem(client, code, verifier)).status).toBe(400);
    expect(await uidFromAccessToken(`Bearer ${access_token}`, cfg)).toBeNull();
  });

  it("spends a code on a failed attempt too", async () => {
    const { client, code, verifier } = await codeFor();
    expect((await redeem(client, code, pkce().verifier)).status).toBe(400);
    expect((await redeem(client, code, verifier)).status).toBe(400);
  });

  it("refuses the wrong verifier, redirect URI or client", async () => {
    let c = await codeFor();
    expect((await redeem(c.client, c.code, pkce().verifier)).json).toMatchObject({ error: "invalid_grant" });
    c = await codeFor();
    expect((await redeem(c.client, c.code, c.verifier, "https://claude.ai/other")).json).toMatchObject({ error: "invalid_grant" });
    c = await codeFor();
    const other = await registerClient();
    expect((await redeem(other, c.code, c.verifier)).json).toMatchObject({ error: "invalid_grant" });
  });

  it("expires access tokens and rotates refresh tokens", async () => {
    const { client, code, verifier } = await codeFor();
    const first = (await redeem(client, code, verifier)).json as { access_token: string; refresh_token: string };

    clock += 61 * 60 * 1000;
    expect(await uidFromAccessToken(`Bearer ${first.access_token}`, cfg)).toBeNull();

    const refreshed = await call("POST", "/oauth/token", { body: { grant_type: "refresh_token", client_id: client, refresh_token: first.refresh_token } });
    expect(refreshed.status).toBe(200);
    const second = refreshed.json as { access_token: string };
    expect(await uidFromAccessToken(`Bearer ${second.access_token}`, cfg)).toBe("alice");

    // The old refresh token was spent by that exchange. Presenting it again means two parties
    // hold the grant, so everything descended from it is revoked — the new pair included.
    const again = await call("POST", "/oauth/token", { body: { grant_type: "refresh_token", client_id: client, refresh_token: first.refresh_token } });
    expect(again.status).toBe(400);
    expect(await uidFromAccessToken(`Bearer ${second.access_token}`, cfg)).toBeNull();
  });

  it("keeps grants apart: revoking one leaves another sign-in working", async () => {
    const a = await codeFor();
    const b = await codeFor(a.client);
    const tokensA = (await redeem(a.client, a.code, a.verifier)).json as { access_token: string };
    const tokensB = (await redeem(b.client, b.code, b.verifier)).json as { access_token: string };
    await redeem(a.client, a.code, a.verifier);
    expect(await uidFromAccessToken(`Bearer ${tokensA.access_token}`, cfg)).toBeNull();
    expect(await uidFromAccessToken(`Bearer ${tokensB.access_token}`, cfg)).toBe("alice");
  });
});

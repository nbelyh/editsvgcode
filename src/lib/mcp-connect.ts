/**
 * The consent step of connecting an MCP client (Claude and others) to an editsvgcode account.
 * The authorization server lives in functions/ and is served on this same site (/oauth/*), so
 * the calls are same-origin; the answer comes back as the URL to send the browser on to.
 */

export interface ConnectRequest {
  clientName: string;
  /** Where the answer is sent — shown, so a lookalike client name cannot hide it. */
  redirectHost: string;
}

async function errorOf(res: Response): Promise<string> {
  const body = await res.json().catch(() => null) as { error?: string } | null;
  return body?.error ?? `The server answered ${res.status}.`;
}

export async function loadConnectRequest(id: string): Promise<ConnectRequest> {
  const res = await fetch(`/oauth/request?id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(await errorOf(res));
  return res.json();
}

/** Approve (with the signed-in user's ID token) or decline; resolves to where to go next. */
export async function answerConnectRequest(id: string, approve: boolean, idToken?: string): Promise<string> {
  const res = await fetch('/oauth/approve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(approve && idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify({ request: id, approve }),
  });
  if (!res.ok) throw new Error(await errorOf(res));
  const { redirect } = await res.json() as { redirect: string };
  return redirect;
}

import { describe, it, expect, beforeEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer, documentIdOf } from "../server";
import { MemoryDocumentStore } from "../documents";
import { handleRequest } from "../handler";
import { MemoryOAuthStore } from "../oauth-store";
import { MemoryTicketStore, handlePicture, issueTicket } from "../pictures";
import { PICTURE_WIDGET_URI, WIDGET_URI } from "../widget";
import { CLIP_MARKER } from "../../../src/lib/svg-ai";

const DRAWING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect id="box" x="10" y="10" width="30" height="30" fill="red"/>
  <text id="label" x="50" y="50">Hello</text>
</svg>`;

const WIDGET_PAGE = "<!doctype html><title>preview</title>";
const PICTURE_URL = "https://us-central1-test.cloudfunctions.net/mcp/picture";

let store: MemoryDocumentStore;
let tickets: MemoryTicketStore;

/** A real MCP client, talking to the server through the same stateless transport the endpoint uses. */
async function connect(uid = "alice"): Promise<Client> {
  const fetchViaServer: typeof fetch = async (input, init) => {
    const server = createMcpServer({
      uid, store, editorUrl: "https://editsvgcode.com",
      widgetHtml: async (file) => (file === "widget.html" ? WIDGET_PAGE : `<!doctype html><title>${file}</title>`),
      pictures: { url: PICTURE_URL, tickets },
    });
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    await server.connect(transport);
    const res = await transport.handleRequest(new Request(input as RequestInfo, init));
    // Buffered, as the Azure function returns it.
    const body = res.body ? await res.text() : null;
    await server.close();
    return new Response(body, { status: res.status, headers: res.headers });
  };
  const client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL("https://api.test/api/mcp"), { fetch: fetchViaServer }));
  return client;
}

async function call(client: Client, name: string, args: Record<string, unknown>) {
  const res = await client.callTool({ name, arguments: args });
  const content = res.content as Array<{ type: string; text: string }>;
  return { text: content.map((c) => c.text).join("\n"), isError: res.isError === true };
}

async function created(client: Client, svg = DRAWING): Promise<string> {
  const { text } = await call(client, "create_document", { svg, title: "Test" });
  return text.match(/^Document (\S+)/)![1];
}

beforeEach(() => {
  store = new MemoryDocumentStore();
  tickets = new MemoryTicketStore();
});

describe("MCP server", () => {
  it("lists the document tools with a document_id on each", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    expect(names).toEqual(expect.arrayContaining([
      "create_document", "open_document", "list_documents", "query", "set_attribute", "replace_lines", "replace_svg",
    ]));
    const setAttribute = tools.find((t) => t.name === "set_attribute")!;
    expect(setAttribute.inputSchema.required).toEqual(["document_id", "edits"]);
  });

  it("creates a document and opens it as numbered lines with the editor link", async () => {
    const client = await connect();
    const id = await created(client);
    const { text } = await call(client, "open_document", { document_id: `https://editsvgcode.com/${id}` });
    expect(text).toContain(`https://editsvgcode.com/${id}`);
    expect(text).toContain('2:   <rect id="box"');
  });

  it("edits structurally and saves the result", async () => {
    const client = await connect();
    const id = await created(client);
    const res = await call(client, "set_attribute", { document_id: id, edits: [{ selector: "#box", name: "fill", value: "blue" }] });
    expect(res.isError).toBe(false);
    expect(res.text).toContain("Saved.");
    expect((await store.get(id))!.text).toContain('fill="blue"');

    await call(client, "set_text", { document_id: id, edits: [{ selector: "#label", text: "Hallo" }] });
    expect((await store.get(id))!.text).toContain(">Hallo</text>");
  });

  it("answers the read tools from the stored document", async () => {
    const client = await connect();
    const id = await created(client);
    expect((await call(client, "query", { document_id: id, selector: "rect" })).text).toContain("1 element(s) matched");
    expect((await call(client, "search_svg", { document_id: id, query: "hello" })).text).toContain("3:");
  });

  it("does not save an edit that breaks a well-formed document", async () => {
    const client = await connect();
    const id = await created(client);
    const res = await call(client, "replace_lines", { document_id: id, edits: [{ start: 3, end: 3, content: "  <text>" }] });
    expect(res.isError).toBe(true);
    expect(res.text).toContain("Not saved");
    expect((await store.get(id))!.text).toBe(DRAWING);
  });

  it("reports a selector that matches nothing as an error and writes nothing", async () => {
    const client = await connect();
    const id = await created(client);
    const res = await call(client, "remove_element", { document_id: id, edits: [{ selector: "#missing" }] });
    expect(res.isError).toBe(true);
    expect((await store.get(id))!.text).toBe(DRAWING);
  });

  it("keeps other people's private documents hidden and their shared ones read-only", async () => {
    const alice = await connect("alice");
    const id = await created(alice);
    const bob = await connect("bob");
    expect((await call(bob, "open_document", { document_id: id })).isError).toBe(true);

    store.docs.get(id)!.visibility = "unlisted";
    expect((await call(bob, "open_document", { document_id: id })).text).toContain("read only");
    const edit = await call(bob, "set_attribute", { document_id: id, edits: [{ selector: "#box", name: "fill", value: "blue" }] });
    expect(edit.isError).toBe(true);
    expect((await store.get(id))!.text).toBe(DRAWING);
  });

  it("lists only the caller's documents", async () => {
    await created(await connect("bob"));
    const alice = await connect("alice");
    const id = await created(alice);
    const { text } = await call(alice, "list_documents", {});
    expect(text).toContain(id);
    expect(text.split("\n").filter((line) => line.startsWith("- "))).toHaveLength(1);
    // The tool a model finds when it looks for files says how to take one from the user.
    expect(text).toContain("upload an SVG file from their computer");
  });
});

describe("the drawing shown in the chat", () => {
  it("shows it through show_document, and keeps get_document_svg for the widget alone", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    const show = tools.find((t) => t.name === "show_document")!;
    expect(show._meta).toEqual({ ui: { resourceUri: WIDGET_URI } });
    const fetch = tools.find((t) => t.name === "get_document_svg")!;
    expect(fetch._meta).toEqual({ ui: { visibility: ["app"] } });
  });

  it("serves the widget pages as MCP App resources, the picture page allowed to fetch its links", async () => {
    const client = await connect();
    const { resources } = await client.listResources();
    expect(resources.map((r) => r.uri)).toEqual([WIDGET_URI, PICTURE_WIDGET_URI]);
    const { contents } = await client.readResource({ uri: WIDGET_URI });
    expect(contents).toEqual([expect.objectContaining({ mimeType: "text/html;profile=mcp-app", text: WIDGET_PAGE })]);
    expect((contents[0]._meta as { ui: { csp: { connectDomains: string[] } } }).ui.csp.connectDomains).toEqual([]);
    const picture = await client.readResource({ uri: PICTURE_WIDGET_URI });
    expect((picture.contents[0]._meta as { ui: { csp: { connectDomains: string[] } } }).ui.csp.connectDomains)
      .toEqual(["https://us-central1-test.cloudfunctions.net"]);
    await expect(client.readResource({ uri: "ui://editsvgcode/preview.html" })).rejects.toThrow();
  });

  it("hands the widget the document's id, and the markup only when it asks", async () => {
    const client = await connect();
    const id = await created(client);
    const shown = await client.callTool({ name: "show_document", arguments: { document_id: id } });
    expect(shown.structuredContent).toEqual({ documentId: id });
    expect(JSON.stringify(shown.content)).not.toContain("<rect");
    const fetched = await client.callTool({ name: "get_document_svg", arguments: { document_id: id } });
    expect(fetched.structuredContent).toEqual({ svg: DRAWING, title: "Test", link: `https://editsvgcode.com/${id}` });
  });

  it("shows the picker from list_documents and upload_document alike, with the user's drawings", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    for (const name of ["list_documents", "upload_document"]) {
      expect(tools.find((t) => t.name === name)!._meta).toEqual({ ui: { resourceUri: WIDGET_URI } });
    }
    const id = await created(client);
    await store.create("bob", DRAWING, "Bob's");
    for (const name of ["list_documents", "upload_document"]) {
      const picker = await client.callTool({ name, arguments: {} });
      expect(picker.structuredContent).toEqual({ documents: [{ id, title: "Test", modified: expect.any(String) }] });
    }
  });

  it("saves a file dropped into the picker with create_document, which names it", async () => {
    const client = await connect();
    const saved = await client.callTool({ name: "create_document", arguments: { svg: DRAWING, title: "fox" } });
    const id = (saved.structuredContent as { documentId: string }).documentId;
    expect((await store.get(id))?.title).toBe("fox");
  });

  it("shows nothing of someone else's private document", async () => {
    const id = await store.create("bob", DRAWING, "Bob's");
    const client = await connect("alice");
    for (const name of ["show_document", "get_document_svg"]) {
      const res = await client.callTool({ name, arguments: { document_id: id } });
      expect(res.isError).toBe(true);
      expect(res.structuredContent).toBeUndefined();
    }
  });
});

describe("pictures", () => {
  const PNG = Buffer.from("89504e470d0a1a0a", "hex");

  it("asks on a card first: generate_image makes nothing and names no link", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.find((t) => t.name === "generate_image")!._meta).toEqual({ ui: { resourceUri: PICTURE_WIDGET_URI } });
    expect(tools.find((t) => t.name === "picture_link")!._meta).toEqual({ ui: { visibility: ["app"] } });
    const card = await client.callTool({ name: "generate_image", arguments: { prompt: "a red fox" } });
    expect(card.structuredContent).toEqual({ prompt: "a red fox", model: "gpt-image-1-mini", credits: 10, editorUrl: "https://editsvgcode.com" });
    expect(JSON.stringify(card)).not.toContain(PICTURE_URL);
    // Where no widget shows the card, the editor opens its own.
    expect(JSON.stringify(card.content)).toContain("https://editsvgcode.com/?generate=a%20red%20fox");
    const unknown = await client.callTool({ name: "generate_image", arguments: { prompt: "x", model: "dall-e" } });
    expect(unknown.isError).toBe(true);
  });

  it("makes the picture behind a link once, charged as the user who asked", async () => {
    const client = await connect("alice");
    const link = await client.callTool({ name: "picture_link", arguments: { prompt: "a red fox", model: "gpt-image-1-mini", outlines: false } });
    const url = (link.structuredContent as { url: string }).url;
    expect(url.startsWith(`${PICTURE_URL}/`)).toBe(true);
    const token = url.slice(PICTURE_URL.length + 1);

    const calls: Array<{ uid: string; body: unknown }> = [];
    const callImageApi = async (uid: string, body: unknown) => {
      calls.push({ uid, body });
      return new Response(PNG, { status: 200, headers: { "X-Credits-Remaining": "20" } });
    };
    const first = await handlePicture("GET", token, undefined, { tickets, callImageApi });
    expect(first.status).toBe(200);
    expect(first.headers["Content-Type"]).toBe("image/png");
    expect(first.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(first.headers["X-Credits-Remaining"]).toBe("20");
    expect(first.body).toEqual(PNG);
    expect(calls).toEqual([{ uid: "alice", body: { kind: "generate", prompt: "a red fox", model: "gpt-image-1-mini", outlines: false, detail: false } }]);

    const again = await handlePicture("GET", token, undefined, { tickets, callImageApi });
    expect(again.status).toBe(410);
    expect(calls).toHaveLength(1);
  });

  it("refuses an expired link, and passes on the API's refusal when credits run out", async () => {
    const token = await issueTicket(tickets, { uid: "alice", kind: "generate", prompt: "fox", model: "gpt-image-1-mini", outlines: true, detail: false }, 0);
    const never = async () => { throw new Error("called"); };
    expect((await handlePicture("GET", token, undefined, { tickets, callImageApi: never, now: () => 10 * 60_000 })).status).toBe(410);

    const fresh = await issueTicket(tickets, { uid: "alice", kind: "generate", prompt: "fox", model: "gpt-image-1.5", outlines: true, detail: false });
    const broke = async () => new Response(JSON.stringify({ error: "Pro required", code: "PRO_REQUIRED" }), { status: 402 });
    const out = await handlePicture("GET", fresh, undefined, { tickets, callImageApi: broke });
    expect(out.status).toBe(402);
    expect(JSON.parse(String(out.body))).toEqual({ error: "Pro required", code: "PRO_REQUIRED" });
  });

  it("answers the browser's preflight and refuses what is not a link", async () => {
    const never = async () => { throw new Error("called"); };
    expect((await handlePicture("OPTIONS", "x", undefined, { tickets, callImageApi: never })).status).toBe(204);
    expect((await handlePicture("GET", "../../etc", undefined, { tickets, callImageApi: never })).status).toBe(404);
    expect((await handlePicture("DELETE", "a".repeat(32), undefined, { tickets, callImageApi: never })).status).toBe(405);
    expect((await handlePicture("POST", "a".repeat(32), Buffer.from("not a png"), { tickets, callImageApi: never })).status).toBe(400);
  });

  it("changes a drawing on a card too: the PNG sent up goes to modify-image, and the original stays", async () => {
    const client = await connect("alice");
    const id = await created(client);
    const card = await client.callTool({ name: "modify_image", arguments: { document_id: id, request: "add a hat" } });
    expect(card.structuredContent).toEqual({
      mode: "modify", documentId: id, prompt: "add a hat", model: "gpt-image-1-mini", credits: 10, editorUrl: "https://editsvgcode.com",
    });
    expect(JSON.stringify(card.content)).toContain(`https://editsvgcode.com/${id}?modify=add%20a%20hat`);
    const hidden = await store.create("bob", DRAWING, "Bob's");
    expect((await client.callTool({ name: "modify_image", arguments: { document_id: hidden, request: "x" } })).isError).toBe(true);

    const link = await client.callTool({ name: "picture_link", arguments: { kind: "modify", prompt: "add a hat", model: "gpt-image-1-mini" } });
    const token = (link.structuredContent as { url: string }).url.slice(PICTURE_URL.length + 1);
    const calls: Array<{ uid: string; body: unknown }> = [];
    const callImageApi = async (uid: string, body: unknown) => {
      calls.push({ uid, body });
      return new Response(PNG, { status: 200 });
    };
    // A change is a POST with the picture; a GET on its link spends the link and makes nothing.
    const out = await handlePicture("POST", token, PNG, { tickets, callImageApi });
    expect(out.status).toBe(200);
    expect(calls).toEqual([{
      uid: "alice",
      body: { kind: "modify", prompt: "add a hat", model: "gpt-image-1-mini", outlines: true, detail: false, image: PNG.toString("base64") },
    }]);
    expect((await store.get(id))!.text).toBe(DRAWING);

    const other = await client.callTool({ name: "picture_link", arguments: { kind: "modify", prompt: "x", model: "gpt-image-1-mini" } });
    const otherToken = (other.structuredContent as { url: string }).url.slice(PICTURE_URL.length + 1);
    expect((await handlePicture("GET", otherToken, undefined, { tickets, callImageApi })).status).toBe(400);
    expect(calls).toHaveLength(1);
  });
});

describe("MCP edits that must not be saved", () => {
  it("refuses replace_svg carrying markup copied from a clipped line", async () => {
    const client = await connect();
    const id = await created(client);
    const svg = DRAWING.replace("Hello", `Hello [... 10 ${CLIP_MARKER} ...]`);
    const res = await call(client, "replace_svg", { document_id: id, svg });
    expect(res.isError).toBe(true);
    expect((await store.get(id))!.text).toBe(DRAWING);
  });

  it("refuses replace_svg without markup, even over a malformed document", async () => {
    const client = await connect();
    const id = await created(client, "<svg><g>");
    for (const svg of [undefined, "", "  "]) {
      const res = await call(client, "replace_svg", { document_id: id, svg });
      expect(res.isError).toBe(true);
    }
    expect((await store.get(id))!.text).toBe("<svg><g>");
  });

  it("measures the size limit in bytes, and still lets an oversized document shrink", async () => {
    const client = await connect();
    // Under 900k characters, over 900k bytes in UTF-8.
    const big = `<svg xmlns="http://www.w3.org/2000/svg"><text id="t">${"字".repeat(320_000)}</text></svg>`;
    expect((await call(client, "create_document", { svg: big })).isError).toBe(true);

    const id = await created(client);
    store.docs.get(id)!.text = big.replace("</svg>", '<rect id="r"/></svg>');
    const res = await call(client, "remove_element", { document_id: id, edits: [{ selector: "#r" }] });
    expect(res.isError).toBe(false);
    expect((await store.get(id))!.text).toBe(big);
  });

  it("lets anyone signed in edit a legacy file with no owner, as the Firestore rules do", async () => {
    const client = await connect();
    const id = await created(client);
    Object.assign(store.docs.get(id)!, { uid: null, visibility: "unlisted" });
    const bob = await connect("bob");
    const res = await call(bob, "set_attribute", { document_id: id, edits: [{ selector: "#box", name: "fill", value: "blue" }] });
    expect(res.isError).toBe(false);
  });

  it("answers an id that cannot exist as no such document", async () => {
    const client = await connect();
    for (const document_id of ["https://editsvgcode.com/", "__x__", "a/..", ""]) {
      expect((await call(client, "open_document", { document_id })).isError).toBe(true);
    }
  });
});

describe("the /mcp endpoint", () => {
  /** Just enough of a Node response to read back what the handler wrote. */
  function fakeResponse() {
    const res = {
      status: 0,
      headers: {} as Record<string, string>,
      body: "",
      writeHead(status: number, headers: Record<string, string>) { res.status = status; res.headers = headers; return res; },
      end(body?: string) { res.body = body ?? ""; return res; },
    };
    return res;
  }
  const deps = (uid: string | null) => ({
    documents: store,
    oauth: new MemoryOAuthStore(),
    uidFromFirebaseToken: async () => uid,
    publicOrigin: "https://editsvgcode.com",
  });

  it("refuses GET and DELETE at once rather than opening an event stream", async () => {
    for (const method of ["GET", "DELETE"]) {
      const res = fakeResponse();
      await handleRequest({ method, path: "/mcp", headers: { accept: "text/event-stream" } } as never, res as never, deps("alice"));
      expect(res.status).toBe(405);
    }
  });

  it("asks for sign-in without a valid token", async () => {
    const res = fakeResponse();
    await handleRequest({ method: "POST", path: "/mcp", headers: {} } as never, res as never, deps(null));
    expect(res.status).toBe(401);
    // Where to discover the authorization server (RFC 9728), as the MCP spec requires.
    expect(res.headers["WWW-Authenticate"]).toBe(
      'Bearer resource_metadata="https://editsvgcode.com/.well-known/oauth-protected-resource/mcp", scope="mcp"',
    );
  });

  it("refuses a Firebase ID token, and tells a client with a bad token it is invalid", async () => {
    // deps("alice") would accept the header as a Firebase ID token; MCP must not.
    const res = fakeResponse();
    await handleRequest({ method: "POST", path: "/mcp", headers: { authorization: "Bearer alice-id-token" } } as never, res as never, deps("alice"));
    expect(res.status).toBe(401);
    expect(res.headers["WWW-Authenticate"]).toMatch(/^Bearer error="invalid_token", resource_metadata=/);
  });
});

describe("documentIdOf", () => {
  it("takes a bare id or the first path segment of an editor link", () => {
    expect(documentIdOf("abc123")).toBe("abc123");
    expect(documentIdOf("https://editsvgcode.com/abc123")).toBe("abc123");
    expect(documentIdOf("https://editsvgcode.com/abc123/?x=1")).toBe("abc123");
    expect(documentIdOf("https://editsvgcode.com/")).toBeNull();
    expect(documentIdOf("__x__")).toBeNull();
    expect(documentIdOf("a/..")).toBeNull();
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer, documentIdOf } from "../server";
import { MemoryDocumentStore } from "../documents";
import { handleRequest } from "../handler";
import { MemoryOAuthStore } from "../oauth-store";
import { MemoryTicketStore, handlePicture, issueTicket } from "../pictures";
import { MemoryExportStore, handleExport, EXPORT_TTL_MS } from "../exports";
import { drawPng } from "../render";
import { PICTURE_WIDGET_URI, WIDGET_URI } from "../widget";
import { CLIP_MARKER, STRUCTURAL_EDIT_TOOLS } from "../../../src/lib/svg-ai";

const DRAWING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect id="box" x="10" y="10" width="30" height="30" fill="red"/>
  <text id="label" x="50" y="50">Hello</text>
</svg>`;

const WIDGET_PAGE = "<!doctype html><title>preview</title>";
const PICTURE_URL = "https://europe-west1-test.cloudfunctions.net/mcp/picture";

let store: MemoryDocumentStore;
let tickets: MemoryTicketStore;
let exportStore: MemoryExportStore;
const EXPORT_URL = "https://editsvgcode.com/mcp/export";

/** A real MCP client, talking to the server through the same stateless transport the endpoint uses. */
async function connect(uid = "alice"): Promise<Client> {
  const fetchViaServer: typeof fetch = async (input, init) => {
    const server = createMcpServer({
      uid, store, editorUrl: "https://editsvgcode.com",
      widgetHtml: async (file) => (file === "widget.html" ? WIDGET_PAGE : `<!doctype html><title>${file}</title>`),
      pictures: { url: PICTURE_URL, tickets },
      exports: { url: EXPORT_URL, store: exportStore },
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
  exportStore = new MemoryExportStore();
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

  it("offers every drawing tool the editor's assistant has, and no edit tool it lacks", async () => {
    // The editor's assistant and the connector are one tool set: each tool here plans through
    // the editor's own code, so a tool on one side only is a gap to close, not a feature.
    // editsvgcode-api (src/prompts.ts) lists the same names for the editor's model.
    const EDITOR_TOOLS = [
      "read_svg_lines", "search_svg", "query", "list_path_parts", "get_element_bounds", "get_png_image", "search_icons",
      "generate_image", "modify_image", "replace_svg", "replace_lines", ...STRUCTURAL_EDIT_TOOLS,
    ];
    const { tools } = await (await connect()).listTools();
    const names = tools.map((t) => t.name);
    expect(names).toEqual(expect.arrayContaining(EDITOR_TOOLS));
    const edits = tools.filter((t) => t.annotations?.readOnlyHint === false && t._meta?.ui === undefined).map((t) => t.name);
    expect(edits.filter((n) => !["create_document", "copy_document"].includes(n)).sort())
      .toEqual(["replace_lines", "replace_svg", ...STRUCTURAL_EDIT_TOOLS].sort());
  });

  it("says a traced drawing is one when it is opened, as the editor says it, and a hand-made one is not", async () => {
    const client = await connect();
    const paths = Array.from({ length: 10 }, (_, i) => `  <path d="M0 0 L5 5 Z" transform="translate(${i},${i})" style="fill: #1C1817;"/>`);
    const traced = await created(client, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n${paths.join("\n")}\n</svg>`);
    expect((await call(client, "open_document", { document_id: traced })).text).toMatch(/traced from a picture.*modify_image/s);
    expect((await call(client, "open_document", { document_id: await created(client) })).text).not.toMatch(/traced from a picture/);
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
      .toEqual(["https://europe-west1-test.cloudfunctions.net"]);
    await expect(client.readResource({ uri: "ui://editsvgcode/preview.html" })).rejects.toThrow();
  });

  it("hands the widget the document's id, and the markup only when it asks", async () => {
    const client = await connect();
    const id = await created(client);
    const shown = await client.callTool({ name: "show_document", arguments: { document_id: id } });
    expect(shown.structuredContent).toMatchObject({ documentId: id });
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
      expect(picker.structuredContent).toMatchObject({ documents: [{ id, title: "Test", modified: expect.any(String) }] });
    }
  });

  it("gives the picker previews of the user's own drawings only, and none of a large one", async () => {
    const client = await connect("alice");
    const { tools } = await client.listTools();
    expect(tools.find((t) => t.name === "document_thumbnails")!._meta).toEqual({ ui: { visibility: ["app"] } });
    const mine = await created(client);
    const large = await store.create("alice", `<svg>${"<!-- x -->".repeat(25_000)}</svg>`, "Large");
    const bobs = await store.create("bob", DRAWING, "Bob's");
    const res = await client.callTool({ name: "document_thumbnails", arguments: { document_ids: [mine, large, bobs, "../x", "missing"] } });
    expect(res.structuredContent).toEqual({ thumbnails: { [mine]: DRAWING } });
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

describe("structured results", () => {
  it("carry their text as message, for clients that hand the model only the structured content", async () => {
    const client = await connect();
    const id = await created(client);
    const calls: Array<[string, Record<string, unknown>]> = [
      ["create_document", { svg: DRAWING }],
      ["show_document", { document_id: id }],
      ["list_documents", {}],
      ["generate_image", { prompt: "a fox" }],
      ["modify_image", { document_id: id, request: "add a hat" }],
    ];
    for (const [name, args] of calls) {
      const res = await client.callTool({ name, arguments: args });
      const text = (res.content as Array<{ text: string }>)[0].text;
      expect((res.structuredContent as { message: string }).message).toBe(text);
    }
    const shown = await client.callTool({ name: "show_document", arguments: { document_id: id } });
    expect(shown.structuredContent).toMatchObject({ link: `https://editsvgcode.com/${id}` });
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
    expect(card.structuredContent).toMatchObject({ prompt: "a red fox", model: "gpt-image-1-mini", credits: 10, editorUrl: "https://editsvgcode.com" });
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

  it("lets the card ask again when its link expired or the API could not be reached", async () => {
    // Held as picture_link holds it, then a link that never makes the picture.
    expect(await tickets.hold("card1234567", new Date(Date.now() + 60_000), new Date())).toBe(true);
    const expired = await issueTicket(tickets, { uid: "alice", kind: "generate", prompt: "fox", model: "gpt-image-1-mini", outlines: true, detail: false, target: "card1234567" }, 0);
    expect((await handlePicture("GET", expired, undefined, { tickets, callImageApi: async () => { throw new Error("x"); }, now: () => 10 * 60_000 })).status).toBe(410);
    expect(await tickets.hold("card1234567", new Date(Date.now() + 60_000), new Date())).toBe(true);

    const fresh = await issueTicket(tickets, { uid: "alice", kind: "generate", prompt: "fox", model: "gpt-image-1-mini", outlines: true, detail: false, target: "card1234567" });
    const out = await handlePicture("GET", fresh, undefined, { tickets, callImageApi: async () => { throw new Error("sign-in failed"); } });
    expect(out.status).toBe(502);
    expect(await tickets.hold("card1234567", new Date(Date.now() + 60_000), new Date())).toBe(true);
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
    expect(card.structuredContent).toMatchObject({
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

describe("a picture card the chat shows again", () => {
  const PNG = Buffer.from("89504e470d0a1a0a", "hex");
  const ok = async () => new Response(PNG, { status: 200 });
  const tokenOf = (res: unknown) => (res as { structuredContent: { url: string } }).structuredContent.url.slice(PICTURE_URL.length + 1);

  async function card(client: Client): Promise<string> {
    const res = await client.callTool({ name: "generate_image", arguments: { prompt: "a red fox" } });
    return (res.structuredContent as { targetId: string }).targetId;
  }

  it("names the drawing it will save on each card, and the drawing does not exist yet", async () => {
    const client = await connect();
    const id = await created(client);
    const first = await card(client);
    const modify = await client.callTool({ name: "modify_image", arguments: { document_id: id, request: "add a hat" } });
    const second = (modify.structuredContent as { targetId: string }).targetId;
    expect(first).toMatch(/^[0-9a-z]{10,40}$/);
    expect(second).not.toBe(first);
    expect(await store.get(first)).toBeNull();
    const { tools } = await client.listTools();
    expect(tools.find((t) => t.name === "save_picture")!._meta).toEqual({ ui: { visibility: ["app"] } });
  });

  it("saves the picture under the card's id once, as the user's private drawing", async () => {
    const client = await connect("alice");
    const target = await card(client);
    const saved = await client.callTool({ name: "save_picture", arguments: { document_id: target, svg: DRAWING, title: "Fox" } });
    expect(saved.structuredContent).toMatchObject({ documentId: target });
    expect(await store.get(target)).toMatchObject({ uid: "alice", visibility: "private", title: "Fox", text: DRAWING });

    const again = await client.callTool({ name: "save_picture", arguments: { document_id: target, svg: "<svg/>" } });
    expect(again.isError).toBe(true);
    expect(again.structuredContent).toMatchObject({ made: true, documentId: target });
    expect((await store.get(target))!.text).toBe(DRAWING);
    expect((await client.callTool({ name: "save_picture", arguments: { document_id: "../files/x", svg: DRAWING } })).isError).toBe(true);
  });

  it("gives no second link while the picture is being made, nor once it is saved", async () => {
    const client = await connect("alice");
    const target = await card(client);
    const args = { prompt: "a red fox", model: "gpt-image-1-mini", target_id: target };
    const first = await client.callTool({ name: "picture_link", arguments: args });
    expect(first.isError).toBeFalsy();

    // The page rebuilt mid-picture shows the card again; pressing it pays for nothing more.
    const busy = await client.callTool({ name: "picture_link", arguments: args });
    expect(busy.isError).toBe(true);
    expect(busy.structuredContent).toMatchObject({ busy: true });

    expect((await handlePicture("GET", tokenOf(first), undefined, { tickets, callImageApi: ok })).status).toBe(200);
    await client.callTool({ name: "save_picture", arguments: { document_id: target, svg: DRAWING } });
    const made = await client.callTool({ name: "picture_link", arguments: args });
    expect(made.structuredContent).toMatchObject({ made: true, documentId: target });
  });

  it("lets the card ask again when the API made nothing", async () => {
    const client = await connect("alice");
    const target = await card(client);
    const args = { prompt: "a red fox", model: "gpt-image-1-mini", target_id: target };
    const first = await client.callTool({ name: "picture_link", arguments: args });
    const broke = async () => new Response(JSON.stringify({ error: "Out of credits" }), { status: 402 });
    expect((await handlePicture("GET", tokenOf(first), undefined, { tickets, callImageApi: broke })).status).toBe(402);
    expect((await client.callTool({ name: "picture_link", arguments: args })).isError).toBeFalsy();
  });

  it("holds the card only as long as a picture can take", async () => {
    expect(await tickets.hold("abc1234567", new Date(1000), new Date(0))).toBe(true);
    expect(await tickets.hold("abc1234567", new Date(3000), new Date(500))).toBe(false);
    expect(await tickets.hold("abc1234567", new Date(3000), new Date(1500))).toBe(true);
    expect((await (await connect()).callTool({ name: "picture_link", arguments: { prompt: "x", model: "gpt-image-1-mini", target_id: "A/B" } })).isError).toBe(true);
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

/** As generate_image traces a picture: anonymous paths coloured by an inline style, a base layer first. */
const TRACED = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0 L100 0 L100 100 L0 100 Z" style="fill: #30170D;"/>
  <path d="M10 10 L40 10 L40 40 L10 40 Z" transform="translate(5,5)" style="fill: #F57F14;"/>
  <path d="M60 60 L90 60 L90 90 L60 90 Z" style="fill: #FBD48C;"/>
</svg>`;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** The whole result: text and pictures. */
async function look(client: Client, name: string, args: Record<string, unknown>) {
  const res = await client.callTool({ name, arguments: args });
  const content = res.content as Array<{ type: string; text?: string; data?: string; mimeType?: string }>;
  return {
    text: content.filter((c) => c.type === "text").map((c) => c.text).join("\n"),
    images: content.filter((c) => c.type === "image").map((c) => Buffer.from(c.data!, "base64")),
    isError: res.isError === true,
  };
}

describe("seeing and measuring the drawing", () => {
  it("draws it as a PNG for the model, the size asked", async () => {
    const client = await connect();
    const id = await created(client, TRACED);
    const res = await look(client, "get_png_image", { document_id: id, size: 256 });
    expect(res.isError).toBe(false);
    expect(res.images).toHaveLength(1);
    expect(res.images[0].subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);
    expect(res.images[0].readUInt32BE(16)).toBe(256);
    expect(res.text).toContain("256×256 PNG of the whole drawing");
  });

  it("highlights each address in its own colour and says where it is", async () => {
    const client = await connect();
    const id = await created(client, TRACED);
    const plain = await look(client, "get_png_image", { document_id: id });
    const res = await look(client, "get_png_image", { document_id: id, highlight: ["line 3", "line 4"] });
    expect(res.text).toMatch(/Magenta outline: 1 element matches "line 3", at x=15, y=15, width=30, height=30/);
    expect(res.text).toMatch(/Cyan outline: 1 element matches "line 4", at x=60, y=60, width=30, height=30/);
    expect(res.images[0].equals(plain.images[0])).toBe(false);
  });

  it("says the base layer is one, and answers an address that matches nothing without a picture", async () => {
    const client = await connect();
    // A base layer is one with at least five shapes drawn over it.
    const more = [1, 2, 3].map((i) => `  <path d="M${i * 20} 50 h5 v5 h-5 Z" style="fill: #ffffff;"/>`).join("\n");
    const id = await created(client, TRACED.replace("</svg>", `${more}\n</svg>`));
    expect((await look(client, "get_png_image", { document_id: id, highlight: ["line 2"] })).text).toMatch(/base layer/);
    const none = await look(client, "get_png_image", { document_id: id, highlight: ["#nothing"] });
    expect(none.isError).toBe(true);
    expect(none.images).toHaveLength(0);
  });

  it("measures elements in viewBox units, transforms applied, text included", async () => {
    const client = await connect();
    const traced = await created(client, TRACED);
    expect((await call(client, "get_element_bounds", { document_id: traced, selector: "line 3" })).text)
      .toContain("x=15, y=15, width=30, height=30");
    const drawing = await created(client);
    const label = (await call(client, "get_element_bounds", { document_id: drawing, selector: "#label" })).text;
    expect(label).toMatch(/<text id="label"> — x=5\d(\.\d+)?, y=4\d(\.\d+)?, width=\d+/);
  });
});

describe("text in pictures", () => {
  it("is set in a serif face where the drawing asks for one, quoted or generic", async () => {
    const client = await connect();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
  <text id="sans" x="0" y="40" font-size="40" font-family="Arial">Morning</text>
  <text id="serif" x="0" y="90" font-size="40" font-family="Georgia, serif">Morning</text>
  <text id="quoted" x="0" y="140" font-size="40" style="font-family: 'Times New Roman';">Morning</text>
  <text id="mono" x="0" y="190" font-size="40" font-family="monospace">Morning</text>
</svg>`;
    const id = await created(client, svg);
    const width = async (sel: string) => Number((await call(client, "get_element_bounds", { document_id: id, selector: sel })).text.match(/width=([\d.]+)/)![1]);
    const [sans, serif, quoted, mono] = [await width("#sans"), await width("#serif"), await width("#quoted"), await width("#mono")];
    expect(serif).toBeGreaterThan(0);
    expect(serif).not.toBe(sans);
    expect(quoted).toBe(serif);
    expect(mono).not.toBe(sans);
    expect(mono).not.toBe(serif);
  });
});

describe("copies", () => {
  it("copies a shared drawing into the caller's own, private, leaving the original", async () => {
    const alice = await connect("alice");
    const id = await created(alice, TRACED);
    store.docs.get(id)!.visibility = "unlisted";
    const bob = await connect("bob");
    const res = await call(bob, "copy_document", { document_id: id });
    expect(res.isError).toBe(false);
    const copyId = res.text.match(/Document (\S+)/)![1];
    expect(copyId).not.toBe(id);
    expect(await store.get(copyId)).toMatchObject({ uid: "bob", visibility: "private", title: "Test (copy)", text: TRACED });

    const edit = await call(bob, "set_attribute", { document_id: copyId, edits: [{ selector: "line 3", name: "fill", value: "#EEF2F5" }] });
    expect(edit.isError).toBe(false);
    expect((await store.get(id))!.text).toBe(TRACED);
  });

  it("copies nothing it cannot open", async () => {
    const alice = await connect("alice");
    const id = await created(alice);
    const bob = await connect("bob");
    expect((await call(bob, "copy_document", { document_id: id })).isError).toBe(true);
    expect((await bob.callTool({ name: "list_documents", arguments: {} })).structuredContent).toMatchObject({ documents: [] });
  });
});

describe("a traced picture's colours", () => {
  it("go into the inline style that would otherwise beat fill=", async () => {
    const client = await connect();
    const id = await created(client, TRACED);
    const res = await call(client, "set_attribute", { document_id: id, edits: [{ selector: "line 3", name: "fill", value: "#EEF2F5" }] });
    expect(res.text).toMatch(/style attribute/);
    const saved = (await store.get(id))!.text;
    expect(saved).toContain('transform="translate(5,5)" style="fill: #EEF2F5;"/>');
    expect(saved).not.toContain('fill="#EEF2F5"');
  });
});

describe("downloads", () => {
  /** The link's token, and the file behind it as a browser would fetch it. */
  async function download(text: string, now?: () => number) {
    const url = text.match(/https:\/\/\S+\/mcp\/export\/[\w-]+/)![0];
    expect(url.startsWith(`${EXPORT_URL}/`)).toBe(true);
    return handleExport("GET", url.slice(EXPORT_URL.length + 1), { exports: exportStore, documents: store, drawPng, now });
  }

  it("hands over the SVG file itself behind a link, named after the drawing", async () => {
    const client = await connect();
    const id = await created(client);
    const res = await call(client, "export_document", { document_id: id, format: "svg" });
    expect(res.isError).toBe(false);
    expect(res.text).toContain("curl -L -o Test.svg");
    const out = await download(res.text);
    expect(out.status).toBe(200);
    expect(out.headers["Content-Type"]).toMatch(/image\/svg\+xml/);
    expect(out.headers["Content-Disposition"]).toBe('attachment; filename="Test.svg"');
    expect(out.body).toBe(DRAWING);
  });

  it("draws a PNG at the size asked, and serves the drawing as it is when fetched", async () => {
    const client = await connect();
    const id = await created(client);
    const res = await call(client, "export_document", { document_id: id, format: "png", size: 200 });
    await call(client, "set_attribute", { document_id: id, edits: [{ selector: "#box", name: "fill", value: "blue" }] });
    const out = await download(res.text);
    const png = out.body as Buffer;
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(200);
    expect(png.readUInt32BE(20)).toBe(200);
    const svg = await download((await call(client, "export_document", { document_id: id, format: "svg" })).text);
    expect(svg.body).toContain('fill="blue"');
  });

  it("draws a drawing as a PNG that only the editor's lenient reading accepts, and draws nothing for a HEAD", async () => {
    const client = await connect();
    // Pasted from a web page: xlink: never declared. The editor previews and exports it.
    const pasted = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 10"><rect id="r" width="20" height="10" fill="red"/><use xlink:href="#r"/></svg>';
    const id = await created(client, pasted);
    const { text } = await call(client, "export_document", { document_id: id, format: "png", size: 100 });
    const out = await download(text);
    expect(out.status).toBe(200);
    expect((out.body as Buffer).readUInt32BE(16)).toBe(100);
    expect((out.body as Buffer).readUInt32BE(20)).toBe(50);

    let drawn = 0;
    const token = text.match(/\/mcp\/export\/([\w-]+)/)![1];
    const head = await handleExport("HEAD", token, { exports: exportStore, documents: store, drawPng: (svg, size) => { drawn++; return drawPng(svg, size); } });
    expect(head.status).toBe(200);
    expect(head.headers["Content-Type"]).toBe("image/png");
    expect(drawn).toBe(0);
  });

  it("takes an empty size as no size, and serves a link that runs nothing", async () => {
    const client = await connect();
    const id = await created(client);
    for (const size of [null, ""]) {
      expect((await call(client, "export_document", { document_id: id, format: "png", size })).text).toContain("1024 pixels");
    }
    const out = await download((await call(client, "export_document", { document_id: id, format: "svg" })).text);
    expect(out.headers["Content-Security-Policy"]).toBe("sandbox");
    expect(out.headers["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("stops working when the link expires, or the drawing is no longer the user's to see", async () => {
    const alice = await connect("alice");
    const id = await created(alice);
    store.docs.get(id)!.visibility = "unlisted";
    const bob = await connect("bob");
    const res = await call(bob, "export_document", { document_id: id, format: "svg" });
    expect((await download(res.text, () => Date.now() + EXPORT_TTL_MS + 1000)).status).toBe(404);
    store.docs.get(id)!.visibility = "private";
    expect((await download(res.text)).status).toBe(404);
    expect((await call(bob, "export_document", { document_id: id, format: "svg" })).isError).toBe(true);
  });
});

describe("what create_document answers", () => {
  it("shows a large drawing back as an outline, not all of it again", async () => {
    const client = await connect();
    const d = `M0 0 ${"C1 2 3 4 5 6 ".repeat(60)}Z`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">\n${Array.from({ length: 20 }, (_, i) => `  <path id="p${i}" d="${d}"/>`).join("\n")}\n</svg>`;
    const { text } = await call(client, "create_document", { svg });
    expect(text).toContain('2:   <path id="p0" d="M0 0 C1 2');
    expect(text).toContain(CLIP_MARKER);
    expect(text).toContain("22: </svg>");
    expect(text.length).toBeLessThan(svg.length / 2);
  });

  it("shows a small one whole", async () => {
    const client = await connect();
    const { text } = await call(client, "create_document", { svg: DRAWING });
    expect(text).toContain('2:   <rect id="box" x="10" y="10" width="30" height="30" fill="red"/>');
  });
});

describe("icons", () => {
  const COLLECTIONS = {
    tabler: { name: "Tabler Icons", license: { title: "MIT", spdx: "MIT" }, palette: false },
    mdi: { name: "Material Design Icons", license: { title: "Apache 2.0", spdx: "Apache-2.0" }, palette: false },
  };
  const ICONS: Record<string, string> = {
    tabler: '<path fill="none" stroke="currentColor" stroke-width="2" d="M3 12l9-9l9 9M5 12v7h14v-7"/>',
    mdi: '<path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z"/>',
  };
  const requested: string[] = [];

  beforeEach(() => {
    requested.length = 0;
    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      requested.push(url.pathname);
      const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });
      if (url.pathname === "/search") return json({ icons: ["tabler:home", "mdi:home"], total: 2, collections: COLLECTIONS });
      if (url.pathname === "/collections") return json({ [url.searchParams.get("prefixes")!]: COLLECTIONS[url.searchParams.get("prefixes") as "mdi"] });
      const prefix = url.pathname.slice(1).replace(/\.json$/, "");
      if (ICONS[prefix]) return json({ prefix, width: 24, height: 24, icons: { home: { body: ICONS[prefix] } } });
      return new Response("not found", { status: 404 });
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("lists what a search found, numbered, with a picture of them to choose from", async () => {
    const client = await connect();
    const res = await look(client, "search_icons", { query: "home", style: "any", palette: "monochrome" });
    expect(res.isError).toBe(false);
    expect(res.text).toContain("1. tabler:home — Tabler Icons, MIT");
    expect(res.text).toContain("2. mdi:home — Material Design Icons, Apache 2.0");
    expect(res.images).toHaveLength(1);
    expect(res.images[0].subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);
  });

  it("hands over the one picked, sized for the drawing it goes into", async () => {
    const client = await connect();
    const id = await created(client);
    const { text, isError } = await call(client, "search_icons", { query: "home", pick: "mdi:home", document_id: id });
    expect(isError).toBe(false);
    expect(text).toMatch(/^Icon: mdi:home — Material Design Icons \(Apache 2\.0\)/);
    expect(text).toContain('viewBox="0 0 24 24"');
    expect(text).toContain("insert_element");
    expect(requested).not.toContain("/search");
  });

  it("refuses a name that is not an icon's", async () => {
    const client = await connect();
    expect((await call(client, "search_icons", { query: "home", pick: "../etc" })).isError).toBe(true);
    expect((await call(client, "search_icons", { query: "home", pick: "tabler:nothing" })).isError).toBe(true);
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

  it("serves a download link without sign-in, through Hosting and at the function's own address", async () => {
    const alice = await connect("alice");
    const id = await created(alice);
    const { text } = await call(alice, "export_document", { document_id: id, format: "svg" });
    const token = text.match(/\/mcp\/export\/([\w-]+)/)![1];
    for (const path of [`/mcp/export/${token}`, `/export/${token}`]) {
      const res = fakeResponse();
      await handleRequest({ method: "GET", path, headers: {} } as never, res as never, { ...deps(null), exports: exportStore });
      expect(res.status).toBe(200);
      expect(res.body).toBe(DRAWING);
    }
    const res = fakeResponse();
    await handleRequest({ method: "GET", path: "/mcp/export/not-a-token", headers: {} } as never, res as never, { ...deps(null), exports: exportStore });
    expect(res.status).toBe(404);
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

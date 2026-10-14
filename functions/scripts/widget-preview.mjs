// Builds lib/widget-preview.html: the MCP widget in a stand-in chat host (dev/widget-host.ts),
// to open in a browser straight from disk. Run `npm run build` first for lib/widget.html.
//   node scripts/widget-preview.mjs [drawing.svg]
// Without a drawing it shows one of the gallery's seed drawings.
import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

async function sample(path) {
  if (path) return { title: basename(path).replace(/\.svg$/i, ""), svg: await readFile(path, "utf8") };
  const { files } = JSON.parse(await readFile(`${root}../gallery.json`, "utf8"));
  const pick = files.find((f) => f.title === "Tiger Head Portrait") ?? files[0];
  return { title: pick.title, svg: pick.text };
}

const widgetHtml = await readFile(`${root}lib/widget.html`, "utf8");
const host = await build({
  absWorkingDir: root,
  entryPoints: ["dev/widget-host.ts"],
  bundle: true,
  write: false,
  format: "esm",
  target: "es2022",
  define: {
    WIDGET_HTML: JSON.stringify(widgetHtml),
    SAMPLE: JSON.stringify(await sample(process.argv[2])),
  },
  logLevel: "warning",
});
const script = host.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Widget preview</title>
<style>
  :root { color-scheme: light; --bg: #f5f4ef; --msg: #fff; --text: #1f1e1d; --line: #ddd; }
  body[data-theme="dark"] { color-scheme: dark; --bg: #262624; --msg: #30302e; --text: #eceae4; --line: #444; }
  body { margin: 0; font: 14px/1.5 system-ui, sans-serif; background: var(--bg); color: var(--text); }
  header { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding: 10px 16px; border-bottom: 1px solid var(--line); }
  #chat { width: 720px; max-width: calc(100% - 32px); margin: 24px auto; }
  .msg { background: var(--msg); border-radius: 12px; padding: 12px 16px; margin-bottom: 12px; }
  #frame { display: block; width: 100%; height: 420px; border: 1px solid var(--line); border-radius: 10px; background: transparent; }
  body.fullscreen #frame { position: fixed; inset: 0; width: 100vw; height: 100vh !important; border: 0; border-radius: 0; z-index: 10; }
  #log { max-height: 160px; overflow: auto; font-size: 12px; opacity: .75; white-space: pre-wrap; }
</style>
</head>
<body>
<header>
  <strong>Widget preview</strong>
  <button id="theme"></button>
  <select id="width" title="Chat column width">
    <option value="720px">Desktop chat (720px)</option>
    <option value="390px">Phone (390px)</option>
    <option value="100%">Full width</option>
  </select>
  <label>Show another drawing <input id="file" type="file" accept=".svg,image/svg+xml"></label>
  <button id="edit" title="Change the drawing behind the widget's back">Simulate an edit</button>
  <button id="upload" title="As if the model called list_documents or upload_document">Show the picker</button>
</header>
<div id="chat">
  <div class="msg">I've drawn it. Here it is:</div>
  <iframe id="frame" sandbox="allow-scripts" title="EditSvgCode preview"></iframe>
  <pre id="log"></pre>
</div>
<script type="module">${script}</script>
</body>
</html>
`;
const out = `${root}lib/widget-preview.html`;
await writeFile(out, html);
console.log(pathToFileURL(out).href);

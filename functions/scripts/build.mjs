// Builds the function into lib/: the server (lib/index.js) and the MCP widget page
// (lib/widget.html) that the show_document tool displays in the chat (src/widget.ts).
import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

// The widget: the editor's Preview, from ../src/mcp-widget. The host loads it into a sandboxed
// iframe that may fetch nothing we do not declare, so the script and styles go inline into one page.
const widget = await build({
  absWorkingDir: root,
  entryPoints: ["../src/mcp-widget/main.tsx"],
  bundle: true,
  write: false,
  outdir: "lib/widget",
  format: "esm",
  target: "es2022",
  jsx: "automatic",
  minify: true,
  legalComments: "none",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});
const js = widget.outputFiles.find((f) => f.path.endsWith(".js")).text;
const css = widget.outputFiles.find((f) => f.path.endsWith(".css"))?.text ?? "";
// A "</script" or "</style" inside the code would close the tag early.
const inline = (code, tag) => code.replace(new RegExp(`</${tag}`, "gi"), `<\\/${tag}`);
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EditSvgCode preview</title>
<style>${inline(css, "style")}</style>
</head>
<body>
<div id="root"></div>
<script type="module">${inline(js, "script")}</script>
</body>
</html>
`;
await mkdir(`${root}lib`, { recursive: true });
await writeFile(`${root}lib/widget.html`, html);

// The server. Dependencies stay external: Cloud Functions installs them from package.json.
await build({
  absWorkingDir: root,
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  packages: "external",
  outfile: "lib/index.js",
  // The widget's ui:// address names its content (src/widget.ts), so a changed page is fetched anew.
  define: { __WIDGET_HASH__: JSON.stringify(createHash("sha256").update(html).digest("hex").slice(0, 12)) },
  logLevel: "warning",
});

console.log(`lib/index.js, lib/widget.html (${Math.round(html.length / 1024)} KB)`);

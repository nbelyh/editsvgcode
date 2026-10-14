// Builds the function into lib/: the server (lib/index.js) and the MCP widget pages (src/widget.ts)
// that tools display in the chat — lib/widget.html (preview and picker) and lib/picture.html.
import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

/**
 * vtracer-webapp, built by wasm-bindgen for bundlers, imports its .wasm as an ES module — what
 * Vite does with vite-plugin-wasm. Here the bytes are inlined and instantiated by hand, as that
 * generated module would be.
 */
const inlineVtracerWasm = {
  name: "inline-vtracer-wasm",
  setup(b) {
    b.onLoad({ filter: /vtracer_webapp\.js$/ }, (args) => ({
      resolveDir: dirname(args.path),
      loader: "js",
      contents: `
        import * as bg from "./vtracer_webapp_bg.js";
        import bytes from "./vtracer_webapp_bg.wasm";
        const { instance } = await WebAssembly.instantiate(bytes, { "./vtracer_webapp_bg.js": bg });
        bg.__wbg_set_wasm(instance.exports);
        instance.exports.__wbindgen_start();
        export { BinaryImageConverter, ColorImageConverter, main } from "./vtracer_webapp_bg.js";
      `,
    }));
  },
};

// A "</script" or "</style" inside the code would close the tag early.
const inline = (code, tag) => code.replace(new RegExp(`</${tag}`, "gi"), `<\\/${tag}`);

/**
 * One widget page, from the editor's source in ../src/mcp-widget. The host loads it into a
 * sandboxed iframe that may fetch nothing we do not declare, so script and styles go inline.
 */
async function page(entry, file, title) {
  const out = await build({
    absWorkingDir: root,
    entryPoints: [entry],
    bundle: true,
    write: false,
    outdir: "lib/page",
    format: "esm",
    target: "es2022",
    jsx: "automatic",
    minify: true,
    legalComments: "none",
    loader: { ".wasm": "binary" },
    plugins: [inlineVtracerWasm],
    define: { "process.env.NODE_ENV": '"production"' },
    logLevel: "warning",
  });
  const js = out.outputFiles.find((f) => f.path.endsWith(".js")).text;
  const css = out.outputFiles.find((f) => f.path.endsWith(".css"))?.text ?? "";
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${inline(css, "style")}</style>
</head>
<body>
<div id="root"></div>
<script type="module">${inline(js, "script")}</script>
</body>
</html>
`;
  await writeFile(`${root}lib/${file}`, html);
  return { html, hash: createHash("sha256").update(html).digest("hex").slice(0, 12) };
}

await mkdir(`${root}lib`, { recursive: true });
const preview = await page("../src/mcp-widget/main.tsx", "widget.html", "EditSvgCode preview");
const picture = await page("../src/mcp-widget/picture.tsx", "picture.html", "EditSvgCode picture");

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
  // Each widget's ui:// address names its content (src/widget.ts), so a changed page is fetched anew.
  define: { __WIDGET_HASHES__: JSON.stringify({ preview: preview.hash, picture: picture.hash }) },
  logLevel: "warning",
});

const kb = (s) => Math.round(s.length / 1024);
console.log(`lib/index.js, lib/widget.html (${kb(preview.html)} KB), lib/picture.html (${kb(picture.html)} KB)`);

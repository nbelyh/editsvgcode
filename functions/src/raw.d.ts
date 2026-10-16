// The editor's modules import some files as text with Vite's "?raw" (src/lib/doc-origin.ts);
// scripts/build.mjs loads them the same way.
declare module "*?raw" {
  const text: string;
  export default text;
}

import { defineConfig } from "vitest/config";

// Its own config, so vitest does not climb to the editor's vite.config.ts (jsdom, React setup).
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

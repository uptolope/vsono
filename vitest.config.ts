import path from "node:path";
import { defineConfig } from "vitest/config";

// Database-backed tests for the Supabase/Postgres-dependent features.
// They need a throwaway LOCAL Postgres: see tests/README.md.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // `server-only` throws outside a React Server environment by design.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/helpers/setup.ts"],
    globalSetup: ["tests/helpers/global-setup.ts"],
    // One shared database: run files one at a time.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});

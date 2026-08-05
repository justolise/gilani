/// <reference types="vitest" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Standalone Vitest config that avoids the TanStack Start vite plugin
 * (which requires an HTTP server context unavailable during test runs).
 *
 * Tests that rely on server-side modules (Supabase, AI SDKs) import only
 * pure utility functions and constants — never live network clients.
 */
export default defineConfig({
  plugins: [
    // Resolves @/* path aliases defined in tsconfig.json without pulling in
    // TanStack's full plugin chain.
    tsconfigPaths(),
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["node_modules", ".output", ".vercel"],
    // Suppress noisy console output during test runs
    silent: false,
    reporters: ["verbose"],
  },
});

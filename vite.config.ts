// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.

// When NITRO_PRESET=vercel is set (e.g. in Vercel's build environment),
// enable the Nitro Vercel adapter so output goes to .vercel/output/.
// Locally this is undefined, so the default Cloudflare/dev behaviour is used.
// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// nitro/vite builds from this
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { config } from "dotenv";

config();

const nitroPreset = process.env.NITRO_PRESET || (process.env.VERCEL === "1" ? "vercel" : undefined);

export default defineConfig({
  vite: {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
      ),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
          process.env.SUPABASE_PUBLISHABLE_KEY ||
          process.env.VITE_SUPABASE_ANON_KEY ||
          process.env.SUPABASE_ANON_KEY ||
          "",
      ),
    },
    ssr: {
      external: ["nodemailer"],
    },
    optimizeDeps: {
      include: ["katex", "katex/dist/contrib/mhchem.min.js"],
    },
    build: {
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (
                id.includes("/node_modules/react/") ||
                id.includes("/node_modules/react-dom/") ||
                id.includes("/node_modules/scheduler/")
              ) {
                return "vendor-react";
              }
              if (
                id.includes("katex") ||
                id.includes("jsxgraph") ||
                id.includes("mermaid") ||
                id.includes("smiles-drawer")
              ) {
                return "vendor-math-diagrams";
              }
              if (id.includes("jspdf")) {
                return "vendor-pdf";
              }
              if (id.includes("@ai-sdk") || id.includes("/node_modules/ai/")) {
                return "vendor-ai";
              }
              if (id.includes("@radix-ui")) {
                return "vendor-radix";
              }
            }
          },
        },
        onwarn(warning, warn) {
          if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message.includes(`"use client"`))
            return;
          if (warning.code === "EVAL" && warning.loc?.file?.includes("jsxgraph")) return;
          warn(warning);
        },
      },
    },
  },
  tanstackStart: {
    serverFns: {
      disableCsrfMiddlewareWarning: true,
    },
  },
  nitro: {
    rollupConfig: {
      onwarn(warning: any, warn: any) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message.includes(`"use client"`))
          return;
        if (warning.code === "EVAL" && warning.loc?.file?.includes("jsxgraph")) return;
        warn(warning);
      },
    },
    ...(nitroPreset
      ? {
          preset: nitroPreset,
          output:
            nitroPreset === "vercel"
              ? {
                  dir: ".vercel/output",
                  serverDir: ".vercel/output/functions/__server.func",
                  publicDir: ".vercel/output/static",
                }
              : undefined,
        }
      : {}),
  } as any,
});

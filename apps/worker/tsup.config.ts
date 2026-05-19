import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  target: "es2022",
  noExternal: [/^@workspace\//],
  // p-limit v6 is ESM-only; keep it external for CJS interop.
  external: ["p-limit"],
})

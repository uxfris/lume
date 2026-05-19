import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["cjs"],
  target: "es2022",
  // Workspace packages ship TypeScript sources; bundle them for `node dist/server.js`.
  noExternal: [/^@workspace\//],
})

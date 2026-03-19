import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    testTimeout: 60_000,
    exclude: ["**/node_modules/**", "**/tests/e2e/**"],
  },
  plugins: [tsconfigPaths()],
});

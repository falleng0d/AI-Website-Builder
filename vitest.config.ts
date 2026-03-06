import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "tests/e2e/**"],
  },
  plugins: [tsconfigPaths()],
});

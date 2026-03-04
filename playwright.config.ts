import { defineConfig, devices } from "@playwright/test";
import { env } from "./lib/env";

const hostname = env["HOSTNAME"]?.trim();
const baseURL = hostname ? `https://${hostname}` : "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 1,
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

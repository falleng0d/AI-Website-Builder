import { expect, test, type Page } from "@playwright/test";
import { createToolErrorGuard } from "./tool-call-guards";

test.setTimeout(30000);

const actionTimeout = 10000;
const overlayPollIntervalMs = 200;

const testUser = {
  name: process.env.E2E_TEST_NAME ?? "Playwright Test User",
  email: process.env.E2E_TEST_EMAIL ?? "playwright-test-user@example.com",
  password: process.env.E2E_TEST_PASSWORD ?? "playwright-password-123",
};

function setupApiErrorLogging(page: Page) {
  page.on("response", async (response) => {
    const url = response.url();
    if (!url.includes("/api/")) return;

    if (!response.ok()) {
      const request = response.request();
      console.error(`[api:${response.status()}] ${request.method()} ${url}`);
      const body = await response.text().catch(() => "(unreadable body)");
      console.error(`[api:${response.status()}] Response body: ${body}`);
    }
  });
}

function setupBrowserLogging(page: Page) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      console.log(`[browser:${message.type()}] ${message.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    console.error(`[browser:pageerror] ${error.message}`);
  });
}

function createOverlayGuard(page: Page) {
  let isActive = true;
  const overlay = page.locator('[data-nextjs-dialog-content="true"]');

  const guard = (async () => {
    while (isActive) {
      const hasOverlay = await overlay.isVisible().catch(() => false);
      if (hasOverlay) {
        const overlayText =
          (await overlay.innerText().catch(() => "Unable to read Next.js overlay content.")).trim() ||
          "Next.js overlay did not contain text.";

        console.error("[e2e] Turbopack runtime overlay detected. Terminating test.");
        console.error(`[e2e] Overlay details:\n${overlayText}`);
        throw new Error("Detected Turbopack runtime overlay.");
      }

      await page.waitForTimeout(overlayPollIntervalMs);
    }
  })();

  return {
    guard,
    stop: () => {
      isActive = false;
    },
  };
}

function createErrorDialogGuard(page: Page) {
  let isActive = true;
  const errorDialog = page.locator('[data-testid="chat-composer-error"]');

  const guard = (async () => {
    while (isActive) {
      const hasError = await errorDialog.isVisible().catch(() => false);
      if (hasError) {
        const errorText = await errorDialog.innerText().catch(() => "Unable to read error dialog content.");
        console.error("[e2e] Error dialog detected. Terminating test.");
        console.error(`[e2e] Error dialog content:\n${errorText}`);
        throw new Error("Detected error dialog.");
      }

      await page.waitForTimeout(overlayPollIntervalMs);
    }
  })();

  return {
    guard,
    stop: () => {
      isActive = false;
    },
  };
}

async function signIn(page: Page) {
  await page.goto("/sign-in", { waitUntil: "domcontentloaded" });
  const emailInput = page.getByPlaceholder("m@example.com");
  const passwordInput = page.getByPlaceholder("********");
  await expect(emailInput).toBeVisible({ timeout: actionTimeout });
  await expect(passwordInput).toBeVisible({ timeout: actionTimeout });
  await emailInput.fill(testUser.email);
  await passwordInput.fill(testUser.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForTimeout(1000);
}

async function signUp(page: Page) {
  await page.goto("/sign-up", { waitUntil: "domcontentloaded" });
  const nameInput = page.getByPlaceholder("John Doe");
  const emailInput = page.getByPlaceholder("m@example.com");
  const passwordInput = page.getByPlaceholder("********");
  await expect(nameInput).toBeVisible({ timeout: actionTimeout });
  await expect(emailInput).toBeVisible({ timeout: actionTimeout });
  await expect(passwordInput).toBeVisible({ timeout: actionTimeout });
  await nameInput.fill(testUser.name);
  await emailInput.fill(testUser.email);
  await passwordInput.fill(testUser.password);
  await page.getByRole("button", { name: "Register" }).click();
  await page.waitForTimeout(1000);
}

async function canAccessDashboard(page: Page) {
  await page.goto("/dashboard");
  await page.waitForLoadState("domcontentloaded");
  return !page.url().includes("/sign-in");
}

async function ensureAuthenticated(page: Page) {
  await signIn(page);
  if (await canAccessDashboard(page)) return;

  await signUp(page);
  await signIn(page);
  expect(await canAccessDashboard(page)).toBe(true);
}

test("login/create user, send hi then how are you, and screenshot result", async ({ page }, testInfo) => {
  setupBrowserLogging(page);
  setupApiErrorLogging(page);
  await ensureAuthenticated(page);

  const overlayGuard = createOverlayGuard(page);
  const errorDialogGuard = createErrorDialogGuard(page);
  const toolErrorGuard = createToolErrorGuard(page, overlayPollIntervalMs);

  try {
    await Promise.race([
      overlayGuard.guard,
      errorDialogGuard.guard,
      toolErrorGuard.guard,
      (async () => {
        await page.goto("/chat");

        const promptInput = page.getByPlaceholder("Describe your design...");
        const sendButton = page.getByRole("button", { name: "Send" });
        const thinkingIndicator = page.getByText("Assistant is thinking...");

        await expect(promptInput).toBeVisible({ timeout: actionTimeout });
        await expect(sendButton).toBeDisabled();

        await promptInput.fill("hi");
        await expect(sendButton).toBeEnabled();
        await sendButton.click();
        await expect(page.getByText("hi", { exact: true })).toBeVisible({ timeout: actionTimeout });
        await expect(thinkingIndicator).toBeVisible({ timeout: actionTimeout });
        await expect(thinkingIndicator).not.toBeVisible({ timeout: actionTimeout });

        await promptInput.fill("how are you");
        await expect(sendButton).toBeEnabled();
        await sendButton.click();
        await expect(page.getByText("how are you", { exact: true })).toBeVisible({ timeout: actionTimeout });
        await expect(thinkingIndicator).toBeVisible({ timeout: actionTimeout });
        await expect(thinkingIndicator).not.toBeVisible({ timeout: actionTimeout });
        await expect
          .poll(async () => page.locator("span", { hasText: "Assistant" }).count(), { timeout: actionTimeout })
          .toBeGreaterThanOrEqual(2);

        await page.waitForTimeout(2000);
        await page.screenshot({ path: testInfo.outputPath("chat-after-hi.png"), fullPage: true });
      })(),
    ]);
  } finally {
    overlayGuard.stop();
    errorDialogGuard.stop();
    toolErrorGuard.stop();
    await overlayGuard.guard.catch(() => undefined);
    await errorDialogGuard.guard.catch(() => undefined);
    await toolErrorGuard.guard.catch(() => undefined);
  }
});

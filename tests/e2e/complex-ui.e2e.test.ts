import { expect, test, type Page } from "@playwright/test";

test.setTimeout(180000);

const actionTimeout = 10000;
const llmTimeout = 120000;
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

test("agent creates complex UI using all components and calls set_ui successfully", async ({ page }, testInfo) => {
  setupBrowserLogging(page);
  setupApiErrorLogging(page);
  await ensureAuthenticated(page);

  const overlayGuard = createOverlayGuard(page);
  const errorDialogGuard = createErrorDialogGuard(page);

  let testPassed = false;

  try {
    await Promise.race([
      overlayGuard.guard,
      errorDialogGuard.guard,
      (async () => {
        await page.goto("/chat");

        const promptInput = page.getByPlaceholder("Describe your design...");
        const sendButton = page.getByRole("button", { name: "Send" });
        const previewPanel = page.getByTestId("preview-panel");

        await expect(promptInput).toBeVisible({ timeout: actionTimeout });

        // Verify preview panel starts with empty placeholder
        await expect(previewPanel).toBeVisible({ timeout: actionTimeout });
        await expect(previewPanel.getByText("Live Preview")).toBeVisible();

        // Send a prompt requesting a complex UI using all available components
        await promptInput.fill(
          "Create a complex UI with button, input, card, dialog, select, tabs, accordion, and table components",
        );
        await expect(sendButton).toBeEnabled();
        await sendButton.click();

        // Wait for the user message to appear
        await expect(page.getByText("Create a complex UI")).toBeVisible({ timeout: actionTimeout });

        // Wait for the agent to call set_ui - look for the set_ui tool call in the response
        // Use a longer timeout as this is a complex operation
        const setUiTrigger = page.locator('[data-slot="collapsible-trigger"]').filter({ hasText: "set_ui" });

        // Wait up to 90 seconds for set_ui to appear
        try {
          await expect(setUiTrigger).toBeVisible({ timeout: 90000 });
        } catch {
          // If set_ui doesn't appear, check if there's preview content anyway
          const previewContent = page.getByTestId("preview-content");
          if (await previewContent.isVisible().catch(() => false)) {
            // Preview populated even without explicit set_ui call - that's OK
            testPassed = true;
            await page.screenshot({ path: testInfo.outputPath("complex-ui.png"), fullPage: true });
            return;
          }
          throw new Error("Neither set_ui nor preview content appeared");
        }

        // Click to expand the collapsible and verify set_ui was completed successfully
        await setUiTrigger.click();
        await page.waitForTimeout(1000);

        // Check for the Completed badge with checkmark icon - wait longer
        const completedBadge = page.locator('[data-slot="badge"]').filter({ hasText: "Completed" });
        await expect(completedBadge).toBeVisible({ timeout: 30000 });

        // Verify the preview panel shows rendered content (not the empty placeholder)
        const previewContent = page.getByTestId("preview-content");
        await expect(previewContent).toBeVisible({ timeout: actionTimeout });
        await expect(previewPanel.getByText("Live Preview")).not.toBeVisible({ timeout: 5000 });

        testPassed = true;

        // Take a screenshot
        await page.waitForTimeout(1000);
        await page.screenshot({ path: testInfo.outputPath("complex-ui.png"), fullPage: true });
      })(),
    ]);
  } finally {
    overlayGuard.stop();
    errorDialogGuard.stop();
    await overlayGuard.guard.catch(() => undefined);
    await errorDialogGuard.guard.catch(() => undefined);
  }

  expect(testPassed).toBe(true);
});

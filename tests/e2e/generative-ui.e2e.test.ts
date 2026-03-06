import { expect, test, type Page } from "@playwright/test";

test.setTimeout(90000);

const actionTimeout = 10000;
const llmTimeout = 60000;
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

async function submitPrompt(page: Page, prompt: string) {
  const promptInput = page.getByPlaceholder("Describe your design...");
  const sendButton = page.getByRole("button", { name: "Send" });

  await expect(promptInput).toBeVisible({ timeout: actionTimeout });
  await promptInput.fill(prompt);
  await expect(sendButton).toBeEnabled();
  await sendButton.click();
  await expect(page.getByText(prompt.slice(0, 40), { exact: false })).toBeVisible({ timeout: actionTimeout });
}

async function waitForAssistantToSettle(page: Page) {
  const thinkingIndicator = page.getByText("Assistant is thinking...");
  await page.waitForTimeout(500);

  if (await thinkingIndicator.isVisible().catch(() => false)) {
    await expect(thinkingIndicator).not.toBeVisible({ timeout: llmTimeout });
    return;
  }

  await page.waitForTimeout(1500);
}

test("agent generates UI that renders in the preview panel", async ({ page }, testInfo) => {
  setupBrowserLogging(page);
  setupApiErrorLogging(page);
  await ensureAuthenticated(page);

  const overlayGuard = createOverlayGuard(page);
  const errorDialogGuard = createErrorDialogGuard(page);

  try {
    await Promise.race([
      overlayGuard.guard,
      errorDialogGuard.guard,
      (async () => {
        await page.goto("/chat");

        const promptInput = page.getByPlaceholder("Describe your design...");
        const previewPanel = page.getByTestId("preview-panel");

        await expect(promptInput).toBeVisible({ timeout: actionTimeout });

        // Verify preview panel starts with empty placeholder
        await expect(previewPanel).toBeVisible({ timeout: actionTimeout });
        await expect(previewPanel.getByText("Live Preview")).toBeVisible();

        // Send a prompt requesting UI generation
        await submitPrompt(
          page,
          'Create a simple card with a heading that says "Hello World" and a text paragraph that says "This is a test"',
        );

        // Wait for the preview panel to show rendered content (the agent must call set_ui)
        const previewContent = page.getByTestId("preview-content");
        await expect(previewContent).toBeVisible({ timeout: llmTimeout });
        await waitForAssistantToSettle(page);

        // Verify the empty placeholder is gone
        await expect(previewPanel.getByText("Live Preview")).not.toBeVisible({ timeout: 5000 });

        await page.waitForTimeout(1000);
        await page.screenshot({ path: testInfo.outputPath("generative-ui.png"), fullPage: true });
      })(),
    ]);
  } finally {
    overlayGuard.stop();
    errorDialogGuard.stop();
    await overlayGuard.guard.catch(() => undefined);
    await errorDialogGuard.guard.catch(() => undefined);
  }
});

test("agent can inspect and surgically edit generated UI", async ({ page }, testInfo) => {
  setupBrowserLogging(page);
  setupApiErrorLogging(page);
  await ensureAuthenticated(page);

  const overlayGuard = createOverlayGuard(page);
  const errorDialogGuard = createErrorDialogGuard(page);

  try {
    await Promise.race([
      overlayGuard.guard,
      errorDialogGuard.guard,
      (async () => {
        await page.goto("/chat");

        const previewPanel = page.getByTestId("preview-panel");
        const previewContent = page.getByTestId("preview-content");

        await expect(previewPanel).toBeVisible({ timeout: actionTimeout });
        await expect(previewPanel.getByText("Live Preview")).toBeVisible();

        await submitPrompt(
          page,
          "Create a UI using exact element ids card-1, card-2, card-3, card-4, and card-5. card-1 must be the root Card titled Card1. card-1 has children card-2 and card-4. card-2 has child card-3. card-4 has child card-5. Every card title must match its number label exactly.",
        );

        await expect(previewContent).toBeVisible({ timeout: llmTimeout });
        await expect(previewPanel.getByText("Card1")).toBeVisible({ timeout: llmTimeout });
        await expect(previewPanel.getByText("Card2")).toBeVisible({ timeout: llmTimeout });
        await expect(previewPanel.getByText("Card5")).toBeVisible({ timeout: llmTimeout });
        await waitForAssistantToSettle(page);

        await submitPrompt(
          page,
          'Use list_ui on path "root" and briefly confirm the hierarchy you find.',
        );

        await expect(page.getByText("root.card-4.card-5", { exact: false })).toBeVisible({ timeout: llmTimeout });
        await waitForAssistantToSettle(page);

        await submitPrompt(
          page,
          'Use edit_element on path "root.card-2" to change the title to "Card2 Updated" and the description to "Edited through edit_element". Do not replace the whole UI.',
        );

        await expect(previewPanel.getByText("Card2 Updated")).toBeVisible({ timeout: llmTimeout });
        await expect(previewPanel.getByText("Edited through edit_element")).toBeVisible({ timeout: llmTimeout });
        await waitForAssistantToSettle(page);

        await submitPrompt(
          page,
          'Use delete_element on path "root.card-4". Do not rebuild the full UI.',
        );

        await expect(previewPanel.getByText("Card4")).not.toBeVisible({ timeout: llmTimeout });
        await expect(previewPanel.getByText("Card5")).not.toBeVisible({ timeout: llmTimeout });
        await waitForAssistantToSettle(page);

        await submitPrompt(
          page,
          'Use replace_element on path "root.card-2" to replace it with a new Card subtree whose root id is "replacement-card", title is "Replacement Card", and it has one Text child with id "replacement-copy" and text "Replacement child content".',
        );

        await expect(previewPanel.getByText("Replacement Card")).toBeVisible({ timeout: llmTimeout });
        await expect(previewPanel.getByText("Replacement child content")).toBeVisible({ timeout: llmTimeout });
        await expect(previewPanel.getByText("Card2 Updated")).not.toBeVisible({ timeout: llmTimeout });
        await page.screenshot({ path: testInfo.outputPath("generative-ui-surgical-editing.png"), fullPage: true });
      })(),
    ]);
  } finally {
    overlayGuard.stop();
    errorDialogGuard.stop();
    await overlayGuard.guard.catch(() => undefined);
    await errorDialogGuard.guard.catch(() => undefined);
  }
});

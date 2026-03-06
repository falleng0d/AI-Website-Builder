import { expect, test, type Page } from "@playwright/test";

test.setTimeout(30000);

const actionTimeout = 10000;
const overlayPollIntervalMs = 200;

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

test("component tree inspects a fixture UI without agent generation", async ({ page }, testInfo) => {
  setupBrowserLogging(page);
  setupApiErrorLogging(page);

  const overlayGuard = createOverlayGuard(page);

  try {
    await Promise.race([
      overlayGuard.guard,
      (async () => {
        await page.goto("/chat?fixture=component-tree", { waitUntil: "domcontentloaded" });

        const previewPanel = page.getByTestId("preview-panel");
        const previewContent = page.getByTestId("preview-content");
        const treeToggle = page.getByRole("button", { name: "Show component tree" });

        await expect(previewPanel).toBeVisible({ timeout: actionTimeout });
        await expect(previewContent).toBeVisible({ timeout: actionTimeout });
        await expect(previewPanel.getByText("Studio Launch")).toBeVisible({ timeout: actionTimeout });
        await expect(treeToggle).toBeVisible({ timeout: actionTimeout });

        await treeToggle.click();

        const treePanel = page.getByTestId("component-tree-panel");
        const rootNode = page.getByTestId("component-tree-node-page-root");
        const heroCopyNode = page.getByTestId("component-tree-node-hero-copy");
        const featureButtonNode = page.getByTestId("component-tree-node-feature-button");

        await expect(treePanel).toBeVisible({ timeout: actionTimeout });
        await expect(rootNode).toContainText("Stack");
        await expect(rootNode).toContainText("page-root");
        await expect(heroCopyNode).toContainText('"Inspect nested UI elements');
        await expect(featureButtonNode).toContainText("Button");

        const previewHeroCopy = previewPanel.locator('[data-ui-element-id="hero-copy"]');
        const previewFeatureButton = previewPanel.locator('[data-ui-element-id="feature-button"]');

        await expect(previewHeroCopy).toHaveAttribute("data-ui-highlighted", "false");
        await heroCopyNode.hover();
        await expect(previewHeroCopy).toHaveAttribute("data-ui-highlighted", "true");

        await featureButtonNode.hover();
        await expect(previewHeroCopy).toHaveAttribute("data-ui-highlighted", "false");
        await expect(previewFeatureButton).toHaveAttribute("data-ui-highlighted", "true");

        await treePanel.hover();
        await expect(previewFeatureButton).toHaveAttribute("data-ui-highlighted", "false");

        await page.screenshot({ path: testInfo.outputPath("component-tree-fixture.png"), fullPage: true });
      })(),
    ]);
  } finally {
    overlayGuard.stop();
    await overlayGuard.guard.catch(() => undefined);
  }
});

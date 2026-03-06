import { type Page } from "@playwright/test";

export function createToolErrorGuard(page: Page, pollIntervalMs = 200) {
  let isActive = true;
  const toolErrorCards = page.locator('[data-slot="collapsible"]').filter({
    has: page.locator('[data-slot="badge"]').filter({ hasText: /^Error$/ }),
  });

  const guard = (async () => {
    while (isActive) {
      const errorCount = await toolErrorCards.count().catch(() => 0);

      for (let index = 0; index < errorCount; index += 1) {
        const toolErrorCard = toolErrorCards.nth(index);
        const isVisible = await toolErrorCard.isVisible().catch(() => false);

        if (!isVisible) {
          continue;
        }

        const toolErrorText =
          (await toolErrorCard.innerText().catch(() => "Unable to read tool error content.")) ||
          "Tool error card did not contain text.";

        console.error("[e2e] Failed tool call detected. Terminating test.");
        console.error(`[e2e] Tool error content:\n${toolErrorText}`);
        throw new Error("Detected failed tool call.");
      }

      await page.waitForTimeout(pollIntervalMs);
    }
  })();

  return {
    guard,
    stop: () => {
      isActive = false;
    },
  };
}

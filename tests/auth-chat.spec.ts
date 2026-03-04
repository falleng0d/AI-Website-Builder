import { expect, test, type Page } from "@playwright/test";

test.setTimeout(180000);

const testUser = {
  name: process.env.E2E_TEST_NAME ?? "Playwright Test User",
  email: process.env.E2E_TEST_EMAIL ?? "playwright-test-user@example.com",
  password: process.env.E2E_TEST_PASSWORD ?? "playwright-password-123",
};

async function signIn(page: Page) {
  await page.goto("/sign-in", { waitUntil: "domcontentloaded" });
  const emailInput = page.getByPlaceholder("m@example.com");
  const passwordInput = page.getByPlaceholder("********");
  await expect(emailInput).toBeVisible({ timeout: 60000 });
  await expect(passwordInput).toBeVisible({ timeout: 60000 });
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
  await expect(nameInput).toBeVisible({ timeout: 60000 });
  await expect(emailInput).toBeVisible({ timeout: 60000 });
  await expect(passwordInput).toBeVisible({ timeout: 60000 });
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

test("login/create user, send hi in chat, and screenshot result", async ({ page }, testInfo) => {
  await ensureAuthenticated(page);

  await page.goto("/chat");
  const messageInput = page.getByLabel("Message input");
  await expect(messageInput).toBeVisible();

  const createThreadButton = page.getByRole("button", { name: "Create new thread" });
  if (await createThreadButton.isVisible()) {
    await createThreadButton.click();
  }

  await messageInput.fill("hi");
  await messageInput.press("Enter");

  await expect(page.locator('[data-role="user"]').filter({ hasText: "hi" }).last()).toBeVisible({ timeout: 20000 });

  const assistantMessage = page.locator('[data-role="assistant"]').last();
  await expect(assistantMessage).toBeVisible({ timeout: 60000 });
  await expect(assistantMessage).toContainText(/\S+/, { timeout: 60000 });

  await page.waitForTimeout(2000);
  await page.screenshot({ path: testInfo.outputPath("chat-after-hi.png"), fullPage: true });
});

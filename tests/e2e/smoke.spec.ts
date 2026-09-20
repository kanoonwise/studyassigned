import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("a signed-out visitor is redirected away from /admin", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
});

test("a signed-out visitor is redirected away from /account", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login/);
});

test.describe("public pages", () => {
  for (const path of [
    "/services",
    "/how-it-works",
    "/integrity",
    "/faq",
    "/contact",
    "/terms",
    "/privacy",
  ]) {
    test(`${path} loads with a heading`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
    });
  }
});

test("the contact page has an enquiry form with required consent", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveAttribute("required", "");
  await expect(page.getByRole("button", { name: "Send enquiry" })).toBeVisible();
});

test("the Thesis Timeline Planner computes and offers an .ics download", async ({ page }) => {
  await page.goto("/tools/timeline");
  await page.getByLabel("Submission date").fill("2026-12-01");
  await page.getByRole("button", { name: "Build timeline" }).click();
  await expect(page.getByText("Final submission")).toBeVisible();
  await expect(page.getByRole("button", { name: /Download as calendar/ })).toBeVisible();
});

test("the AI-Use Disclosure Generator produces a statement", async ({ page }) => {
  await page.goto("/tools/disclosure");
  await page.getByLabel("From", { exact: true }).fill("2026-01-01");
  await page.getByLabel("To", { exact: true }).fill("2026-01-10");
  await page.getByRole("button", { name: "Generate statement" }).click();
  await expect(page.locator("pre")).toContainText("AI-Use Disclosure");
});

test("the universities search page loads with a search box", async ({ page }) => {
  const response = await page.goto("/universities");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByPlaceholder("Search by institution name, state or district"),
  ).toBeVisible();
});

test("an unknown institution code 404s", async ({ page }) => {
  const response = await page.goto("/universities/DOES-NOT-EXIST");
  expect(response?.status()).toBe(404);
});

test("the AI-Flag Appeal Kit drafts a letter", async ({ page }) => {
  await page.goto("/tools/appeal-kit");
  await page.getByLabel("Your name").fill("Asha Rao");
  await page.getByLabel("Institution").fill("Test University");
  await page.getByRole("button", { name: "Draft letter" }).click();
  await expect(page.locator("pre")).toContainText("Asha Rao");
});

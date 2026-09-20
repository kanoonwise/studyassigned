import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("a signed-out visitor is redirected away from /admin", async ({ page }) => {
  await page.goto("/admin");
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

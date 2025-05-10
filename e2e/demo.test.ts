import { expect, test } from "@playwright/test";

test("home page has expected h1", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("data-test-id=nav-bar")).toBeVisible();
});

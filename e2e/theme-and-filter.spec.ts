import { expect, test } from "@playwright/test";

test.describe("interactive experience", () => {
  test("supports theme toggling and portfolio filters", async ({ page }) => {
    await page.goto("/");

    const enterButton = page.getByRole("button", {
      name: /enter things inc portfolio/i,
    });
    await expect(enterButton).toBeVisible();
    await enterButton.click();

    const searchInput = page.getByRole("textbox", { name: /search projects/i });
    await searchInput.waitFor({ state: "visible" });

    const themeToggle = page.getByRole("button", { name: /switch to/i });
    const initialLabel = await themeToggle.getAttribute("aria-label");
    await themeToggle.click();
    await expect(themeToggle).not.toHaveAttribute("aria-label", initialLabel ?? "");

    await searchInput.fill("retro");
    await expect(page.getByRole("heading", { name: /retro tv/i })).toBeVisible();

    await searchInput.fill("");
    const mobilityFilter = page.getByRole("button", { name: "Mobility" });
    await mobilityFilter.click();
    await expect(mobilityFilter).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("grid")).toContainText("Transport");

    const allFilter = page.getByRole("button", { name: "All" });
    await allFilter.click();
    await expect(allFilter).toHaveAttribute("aria-pressed", "true");
  });
});

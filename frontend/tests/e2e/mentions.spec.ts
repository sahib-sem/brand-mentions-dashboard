import { expect, test } from "@playwright/test";
import { MentionsDataSupport } from "../pages/mentions/data-support.po";
import { MentionsPage } from "../pages/mentions/mentions-page.po";

test("loads the visibility dashboard with derived metrics and all mention fields", async ({ page }) => {
  const data = new MentionsDataSupport(page);
  const dashboard = new MentionsPage(page);
  await test.step("Given realistic mention and trend responses", async () => { await data.interceptDashboard(); });
  await test.step("When the dashboard loads", async () => { await dashboard.goto(); });
  await test.step("Then the trend summary and mention details are visible", async () => {
    await expect(dashboard.heading()).toBeVisible();
    await expect(page.getByText("363", { exact: true })).toBeVisible();
    await expect(page.getByText("196", { exact: true })).toBeVisible();
    await expect(dashboard.table()).toBeVisible();
    for (const field of ["Query", "Model", "Mentioned", "Position", "Sentiment", "Citation", "Date"]) await expect(page.getByRole("columnheader", { name: field })).toBeVisible();
  });
});

test("applies, resets, and preserves filters in pagination request payloads", async ({ page }) => {
  const data = new MentionsDataSupport(page);
  const dashboard = new MentionsPage(page);
  await test.step("Given the loaded dashboard", async () => { await data.interceptDashboard(); await dashboard.goto(); await expect(dashboard.table()).toBeVisible(); });
  await test.step("When filters are applied", async () => {
    await dashboard.modelSelect().selectOption("claude");
    await dashboard.sentimentSelect().selectOption("positive");
    await dashboard.fromInput().fill("2025-02-01");
    await dashboard.toInput().fill("2025-02-28");
    await dashboard.groupSelect().selectOption("week");
    const mentionsRequest = page.waitForRequest((request) => request.url().endsWith("/mentions") && request.postDataJSON().filters?.model === "claude");
    const trendsRequest = page.waitForRequest((request) => request.url().endsWith("/mentions/trends") && request.postDataJSON().group_by === "week");
    await dashboard.applyButton().click();
    await expect((await mentionsRequest).postDataJSON()).toEqual({ page: 1, per_page: 25, filters: { model: "claude", sentiment: "positive", date_from: "2025-02-01", date_to: "2025-02-28" } });
    await expect((await trendsRequest).postDataJSON()).toEqual({ model: "claude", sentiment: "positive", date_from: "2025-02-01", date_to: "2025-02-28", group_by: "week" });
  });
  await test.step("Then pagination uses the applied mention filters", async () => {
    const requestPromise = page.waitForRequest((request) => request.url().endsWith("/mentions") && request.postDataJSON().page === 2);
    await dashboard.nextButton().click();
    await expect((await requestPromise).postDataJSON()).toMatchObject({ page: 2, filters: { model: "claude", sentiment: "positive" } });
  });
  await test.step("And reset restores the unfiltered day-grouped view", async () => {
    await dashboard.resetButton().click();
    await expect(dashboard.modelSelect()).toHaveValue("");
    await expect(dashboard.sentimentSelect()).toHaveValue("");
    await expect(dashboard.fromInput()).toHaveValue("");
    await expect(dashboard.toInput()).toHaveValue("");
    await expect(dashboard.groupSelect()).toHaveValue("day");
    await expect(page.getByText("Page 1 of 3")).toBeVisible();
  });
});

test("shows loading and empty states", async ({ page }) => {
  const data = new MentionsDataSupport(page);
  const dashboard = new MentionsPage(page);
  await test.step("Given delayed empty responses", async () => { await data.interceptDashboard({ delay: 500, empty: true }); });
  await test.step("When the dashboard starts loading", async () => { await dashboard.goto(); await expect(page.getByRole("status", { name: "Loading dashboard" })).toBeVisible(); });
  await test.step("Then an actionable empty state replaces the skeleton", async () => { await expect(page.getByRole("heading", { name: "No signals in this slice" })).toBeVisible(); await expect(page.getByRole("button", { name: "Clear filters" })).toBeVisible(); });
});

test("recovers from API errors with retry", async ({ page }) => {
  const data = new MentionsDataSupport(page);
  const dashboard = new MentionsPage(page);
  await test.step("Given both API calls initially fail", async () => { await data.interceptDashboard({ failFirst: true }); });
  await test.step("When the dashboard loads", async () => { await dashboard.goto(); });
  await test.step("Then the error is explained", async () => { await expect(page.getByRole("heading", { name: "The signal dropped out" })).toBeVisible(); });
  await test.step("When the user retries", async () => { await dashboard.retryButton().click(); });
  await test.step("Then the dashboard recovers", async () => { await expect(dashboard.table()).toBeVisible(); });
});

test("keeps core controls usable on a mobile viewport", async ({ page }) => {
  const data = new MentionsDataSupport(page);
  const dashboard = new MentionsPage(page);
  await test.step("Given a narrow mobile viewport", async () => { await page.setViewportSize({ width: 390, height: 844 }); await data.interceptDashboard(); });
  await test.step("When the dashboard loads", async () => { await dashboard.goto(); });
  await test.step("Then filters, summary, and the scrollable table remain accessible", async () => {
    await expect(dashboard.heading()).toBeVisible();
    await expect(dashboard.modelSelect()).toBeVisible();
    await expect(dashboard.applyButton()).toBeVisible();
    await expect(dashboard.table()).toBeVisible();
    const overflow = await dashboard.table().evaluate((table) => table.parentElement ? table.scrollWidth > table.parentElement.clientWidth : false);
    expect(overflow).toBe(true);
  });
});

test("removes a single filter from the active chips and resizes the page", async ({ page }) => {
  const data = new MentionsDataSupport(page);
  const dashboard = new MentionsPage(page);
  await test.step("Given a dashboard filtered to one model", async () => {
    await data.interceptDashboard();
    await dashboard.goto();
    await dashboard.modelSelect().selectOption("gemini");
    await dashboard.applyButton().click();
    await expect(dashboard.filterChip("Model")).toBeVisible();
  });
  await test.step("When the model chip is dismissed", async () => {
    await dashboard.filterChip("Model").click();
  });
  await test.step("Then the filter clears from both the chip row and the control", async () => {
    await expect(dashboard.filterChip("Model")).toHaveCount(0);
    await expect(dashboard.modelSelect()).toHaveValue("");
  });
  await test.step("When a larger page size is chosen", async () => {
    const request = page.waitForRequest((r) => r.url().endsWith("/mentions") && r.postDataJSON().per_page === 100);
    await dashboard.perPageSelect().selectOption("100");
    await expect((await request).postDataJSON()).toMatchObject({ page: 1, per_page: 100 });
  });
});

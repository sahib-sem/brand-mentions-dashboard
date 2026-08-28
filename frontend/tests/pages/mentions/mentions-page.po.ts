import type { Locator, Page } from "@playwright/test";

export class MentionsPage {
  constructor(private page: Page) {}
  async goto() { await this.page.goto("/"); }
  heading(): Locator { return this.page.getByRole("heading", { name: "Brand mentions" }); }
  filterToggle(): Locator { return this.page.getByRole("button", { name: /Filters/ }); }
  modelSelect(): Locator { return this.page.getByLabel("Model", { exact: true }); }
  sentimentSelect(): Locator { return this.page.getByLabel("Sentiment", { exact: true }); }
  fromInput(): Locator { return this.page.getByLabel("From", { exact: true }); }
  toInput(): Locator { return this.page.getByLabel("To", { exact: true }); }
  groupSelect(): Locator { return this.page.getByLabel("Group by", { exact: true }); }
  applyButton(): Locator { return this.page.getByRole("button", { name: "Apply" }); }
  resetButton(): Locator { return this.page.getByRole("button", { name: "Reset" }); }
  nextButton(): Locator { return this.page.getByRole("button", { name: "Next page" }); }
  retryButton(): Locator { return this.page.getByRole("button", { name: "Try again" }); }
  table(): Locator { return this.page.getByRole("table"); }
  mobileRecords(): Locator { return this.page.locator("article"); }
  perPageSelect(): Locator { return this.page.getByLabel("Rows per page"); }
  filterChip(name: string): Locator { return this.page.getByRole("button", { name: `Remove ${name} filter` }); }
}

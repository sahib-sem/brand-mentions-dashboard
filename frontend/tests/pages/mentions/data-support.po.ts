import type { Page, Route } from "@playwright/test";
import mentionsFixture from "../../fixtures/mentions/mentions.json";
import trendsFixture from "../../fixtures/mentions/trends.json";

interface MockOptions {
  delay?: number;
  empty?: boolean;
  failFirst?: boolean;
}

export class MentionsDataSupport {
  constructor(private page: Page) {}

  async interceptDashboard(options: MockOptions = {}) {
    let mentionsCalls = 0;
    let trendsCalls = 0;
    await this.page.route("**/mentions**", async (route) => {
      if (route.request().method() !== "POST") { await route.fallback(); return; }
      if (options.delay) await new Promise((resolve) => setTimeout(resolve, options.delay));
      const isTrends = new URL(route.request().url()).pathname.endsWith("/mentions/trends");
      if (isTrends) {
        trendsCalls += 1;
        await this.fulfill(route, trendsCalls, options, options.empty ? { data: [] } : trendsFixture);
        return;
      }
      mentionsCalls += 1;
      const request = route.request().postDataJSON() as { page: number; per_page: number };
      const body = options.empty ? { data: [], total: 0, page: request.page, per_page: request.per_page } : { ...mentionsFixture, page: request.page, per_page: request.per_page };
      await this.fulfill(route, mentionsCalls, options, body);
    });
  }

  private async fulfill(route: Route, calls: number, options: MockOptions, body: unknown) {
    if (options.failFirst && calls === 1) {
      await route.fulfill({ status: 503, json: { detail: "Service unavailable" } });
      return;
    }
    await route.fulfill({ status: 200, json: body });
  }
}

# Notes

**Time spent:** Approximately 3 hours 10 minutes, from receiving repository access at 09:20 EAT through final review at 12:30 EAT.

## Assumptions

- Weeks start on Monday (ISO convention — the spec doesn't say).
- Date filters are inclusive on both ends.
- `per_page` is capped at 100.
- One brand is tracked, so there's no brand selector.

## Decisions

- **All aggregation is SQL.** Totals, page counts, and day/week buckets are `GROUP BY` /
  `COUNT` / `SUM(CASE ...)`. Python only maps rows to response models.
- **One vertical slice** per feature: `router → service → repository → schemas`. FastAPI's own
  dependency injection is enough for two endpoints.
- **Async SQLAlchemy + aiosqlite**, with indexes on `model`, `sentiment`, `created_at`, and
  `mentioned`.
- **Added optional `model` and `sentiment` to `/mentions/trends`.** Without them, filtering the
  table to "Claude, negative" left the chart showing everything — the page disagreed with itself.
  Both fields are optional, so the documented request shape still works.
- **Filters apply on a button,** so a date range can be finished before anything refetches.
  Applied filters then appear as individually removable chips.
- **React Query keeps the previous page on screen** while the next loads. Zod validates every
  response, so contract drift shows a recoverable error instead of a blank page.

## Design

- **Type:** Fraunces (headings), IBM Plex Sans (interface), IBM Plex Mono (figures, IDs, labels).
  Self-hosted via `next/font` — no runtime font request.
- **Color:** warm bone paper, deep forest for actions, one clay accent reserved for the
  "mentioned" series. Sentiment reads moss / neutral / ember.
- **Density:** the page opens on the numbers — compact header, KPIs and chart above the fold,
  table header pinned while rows scroll.

## Testing

- `make test-api` — 21 database-backed API tests: filters, pagination, SQL aggregation,
  validation errors, empty results.
- `make test-web` — 6 Playwright specs: render, filter apply/reset/chip removal, pagination and
  page-size payloads, loading, empty, error + retry, mobile viewport.
- `make check` — Ruff, Pyright, ESLint, TypeScript.

## With more time

- Sortable columns and filters encoded in the URL, so a view can be shared.
- CSV export of the filtered set.
- A warm API host — the free Render instance cold-starts, which is what the retry state covers.
- A post-deploy smoke test against the live frontend and API.

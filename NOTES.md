# Submission Notes

## Time spent

Approximately 3 hours and 30 minutes, including implementation, automated tests, and final verification.

## Key decisions and trade-offs

- I used a single vertical `mentions` feature with router, service, repository, schema, and model boundaries. Native FastAPI dependencies provide the required injection without introducing a separate container for two endpoints.
- SQLite runs through SQLAlchemy's async API and `aiosqlite`. Pagination totals and daily/weekly trends are calculated in SQL; weekly buckets start on Monday.
- Filters are applied as a group instead of issuing a request for every field change. This lets users finish a date range before refreshing the dashboard and avoids unnecessary traffic.
- Summary cards are derived from the trend response rather than adding an undocumented third endpoint. Because the supplied trend request only accepts dates and grouping, model and sentiment filters affect the mentions table but not the trend summary.
- React Query caches previous pages while pagination is loading. Zod validates API responses at the frontend boundary so contract drift produces a visible recoverable error.
- Playwright intercepts the API for deterministic UI behavior tests. Separate backend integration tests execute the real SQL against a temporary SQLite database, and the completed app was also smoke-tested against the 10,000-row seed database.

## With more time

- Add sortable table columns and shareable URL-based filters.
- Add model and sentiment dimensions to the trends contract so every dashboard section reflects every filter.
- Add a post-deployment browser smoke test against the live frontend and backend.
- Add deployment manifests tailored to the selected hosting platform.

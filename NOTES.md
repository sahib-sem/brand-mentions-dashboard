# Notes

**Time spent:** Approximately 3 hours.

## Approach and trade-offs

- Aggregation, filtering, and pagination happen in SQL. The API maps query results into typed
  responses rather than processing the dataset in Python.
- The backend is organized as one focused feature with router, service, and repository boundaries.
  Native FastAPI dependencies provide enough separation without adding a DI framework.
- I extended the trends request with optional model and sentiment filters so the chart and table
  remain consistent. The original request shape remains valid.
- Filters are applied explicitly instead of fetching on every field change. React Query preserves
  existing results during transitions, and Zod validates responses at the client boundary.
- SQLite is appropriate for this read-only exercise and is recreated from the supplied seed during
  deployment. A production system with writes or multiple instances would use managed storage.
- UI tests isolate browser behavior with mocked API responses; backend tests independently exercise
  the real SQL. This keeps the suite deterministic without requiring deployed infrastructure.

## Assumptions

- Date ranges are inclusive, weeks begin on Monday, and page size is capped at 100.
- The supplied dataset represents one tracked brand, so no brand selector is included.

## With more time

- Encode filters and sorting in the URL for shareable views, and add CSV export.
- Add a deployed end-to-end smoke test and move the API to persistent, non-sleeping infrastructure.

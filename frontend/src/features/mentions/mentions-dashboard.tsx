"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DATA_END, DATA_START, Filters, type FilterDraft } from "./filters";
import { useMentionsQuery, useTrendsQuery } from "./hooks";
import { KpiSummary } from "./kpi-summary";
import { MentionsTable } from "./mentions-table";
import { DashboardSkeleton, EmptyState, ErrorState } from "./states";
import { TrendChart } from "./trend-chart";
import type { GroupBy, MentionFilters, Model, Sentiment } from "./types";

const INITIAL_FILTERS: FilterDraft = { group_by: "day" };

export function MentionsDashboard() {
  const searchParams = useSearchParams();
  const [initialState] = useState(() => parseUrlState(searchParams));
  const [draft, setDraft] = useState<FilterDraft>(initialState.filters);
  const [applied, setApplied] = useState<FilterDraft>(initialState.filters);
  const [page, setPage] = useState(initialState.page);
  const [perPage, setPerPage] = useState(initialState.perPage);

  const { group_by, ...mentionFilters } = applied;
  const mentions = useMentionsQuery(page, perPage, mentionFilters);
  const trends = useTrendsQuery(applied);

  const apply = () => {
    setApplied(draft);
    setPage(1);
  };

  const reset = () => {
    setDraft(INITIAL_FILTERS);
    setApplied(INITIAL_FILTERS);
    setPage(1);
  };

  const removeFilter = (key: keyof MentionFilters) => {
    const next = { ...applied, [key]: undefined };
    setDraft(next);
    setApplied(next);
    setPage(1);
  };

  const changePerPage = (next: number) => {
    setPerPage(next);
    setPage(1);
  };

  const retry = () => {
    void mentions.refetch();
    void trends.refetch();
  };

  const initialLoading = !mentions.data && !trends.data && (mentions.isPending || trends.isPending);
  const failed = Boolean(mentions.error || trends.error);
  const refreshing = mentions.isFetching || trends.isFetching;
  const applyingFilters = trends.isFetching && trends.data !== undefined;
  const noResults =
    mentions.data?.data.length === 0 && trends.data?.data.length === 0 && !refreshing;

  useEffect(() => {
    writeUrlState(applied, page, perPage);
  }, [applied, page, perPage]);

  useEffect(() => {
    const restoreUrlState = () => {
      const state = parseUrlState(new URLSearchParams(window.location.search));
      setDraft(state.filters);
      setApplied(state.filters);
      setPage(state.page);
      setPerPage(state.perPage);
    };
    window.addEventListener("popstate", restoreUrlState);
    return () => window.removeEventListener("popstate", restoreUrlState);
  }, []);

  return (
    <main id="dashboard" className="px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-10">
      <div className="mx-auto max-w-[1380px]">
        <header className="mb-6 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-.02em] sm:text-3xl">Brand mentions</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-2">
              Visibility, sentiment, ranking, and citations across four AI models.
            </p>
          </div>
          <dl className="flex gap-5 text-xs text-ink-3 sm:text-right">
            <div>
              <dt>Dataset</dt>
              <dd className="mt-0.5 font-medium text-ink-2">Jan 1 - Mar 30, 2025</dd>
            </div>
            <div>
              <dt>Responses</dt>
              <dd className="nums mt-0.5 font-medium text-ink-2">10,000</dd>
            </div>
          </dl>
        </header>

        <div className="space-y-4">
          <Filters
            value={draft}
            applied={applied}
            onChange={setDraft}
            onApply={apply}
            onReset={reset}
            onRemove={removeFilter}
            isRefreshing={applyingFilters}
          />

          {initialLoading ? (
            <DashboardSkeleton />
          ) : failed ? (
            <ErrorState onRetry={retry} />
          ) : noResults ? (
            <EmptyState onReset={reset} />
          ) : mentions.data && trends.data ? (
            <>
              <KpiSummary trends={trends.data.data} groupBy={group_by} />
              <TrendChart
                data={trends.data.data}
                groupBy={group_by}
                scope={describeScope(applied)}
              />
              {mentions.data.data.length === 0 ? (
                <EmptyState onReset={reset} />
              ) : (
                <MentionsTable
                  mentions={mentions.data.data}
                  page={mentions.data.page}
                  perPage={mentions.data.per_page}
                  total={mentions.data.total}
                  onPageChange={setPage}
                  onPerPageChange={changePerPage}
                  isRefreshing={mentions.isFetching}
                />
              )}
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}

/** Human summary of the applied filters, shown under the chart title. */
function describeScope({ group_by, model, sentiment, date_from, date_to }: FilterDraft) {
  const parts = [`${group_by === "week" ? "Weekly" : "Daily"} buckets`];
  parts.push(model ? `${model} only` : "all models");
  if (sentiment) parts.push(`${sentiment} sentiment`);
  if (date_from && date_to) parts.push(`${date_from} to ${date_to}`);
  else if (date_from) parts.push(`from ${date_from}`);
  else if (date_to) parts.push(`through ${date_to}`);
  else parts.push("full history");
  return parts.join(" · ");
}

const MODELS: Model[] = ["chatgpt", "claude", "gemini", "perplexity"];
const SENTIMENTS: Sentiment[] = ["positive", "neutral", "negative"];

function parseUrlState(params: { get: (name: string) => string | null }) {
  const model = params.get("model");
  const sentiment = params.get("sentiment");
  const group = params.get("group");
  const from = params.get("from");
  const to = params.get("to");
  const page = Number(params.get("page"));
  const perPage = Number(params.get("per_page"));
  const filters: FilterDraft = {
    group_by: (group === "week" ? "week" : "day") as GroupBy,
    model: MODELS.includes(model as Model) ? (model as Model) : undefined,
    sentiment: SENTIMENTS.includes(sentiment as Sentiment) ? (sentiment as Sentiment) : undefined,
    date_from: validDate(from) ? from ?? undefined : undefined,
    date_to: validDate(to) ? to ?? undefined : undefined,
  };
  return {
    filters,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    perPage: [25, 50, 100].includes(perPage) ? perPage : 25,
  };
}

function validDate(value: string | null) {
  return value !== null && value >= DATA_START && value <= DATA_END;
}

function writeUrlState(filters: FilterDraft, page: number, perPage: number) {
  const params = new URLSearchParams();
  if (filters.model) params.set("model", filters.model);
  if (filters.sentiment) params.set("sentiment", filters.sentiment);
  if (filters.date_from) params.set("from", filters.date_from);
  if (filters.date_to) params.set("to", filters.date_to);
  if (filters.group_by === "week") params.set("group", "week");
  if (page > 1) params.set("page", String(page));
  if (perPage !== 25) params.set("per_page", String(perPage));
  const query = params.toString();
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

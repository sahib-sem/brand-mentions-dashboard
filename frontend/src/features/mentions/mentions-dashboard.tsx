"use client";

import { useState } from "react";
import { Filters, type FilterDraft } from "./filters";
import { useMentionsQuery, useTrendsQuery } from "./hooks";
import { KpiSummary } from "./kpi-summary";
import { MentionsTable } from "./mentions-table";
import { DashboardSkeleton, EmptyState, ErrorState } from "./states";
import { TrendChart } from "./trend-chart";
import type { MentionFilters } from "./types";

const INITIAL_FILTERS: FilterDraft = { group_by: "day" };

export function MentionsDashboard() {
  const [draft, setDraft] = useState<FilterDraft>(INITIAL_FILTERS);
  const [applied, setApplied] = useState<FilterDraft>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

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
  const noResults =
    mentions.data?.data.length === 0 && trends.data?.data.length === 0 && !refreshing;

  return (
    <main id="dashboard" className="px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-10">
      <div className="mx-auto max-w-[1380px]">
        <header className="mb-8 border-b border-line pb-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Mark />
              <span className="font-display text-base font-semibold tracking-[-.01em]">
                Signaldesk
              </span>
            </div>
            <p className="flex items-center gap-2 font-mono text-[.68rem] uppercase tracking-[.12em] text-ink-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss" />
              </span>
              Live
            </p>
          </div>
          <h1 className="max-w-3xl font-display text-3xl font-semibold leading-[1.1] tracking-[-.025em] sm:text-[2.9rem]">
            Brand visibility across AI answers
          </h1>
          <p className="mt-3 max-w-2xl text-[.95rem] leading-6 text-ink-2">
            Every tracked response from ChatGPT, Claude, Gemini, and Perplexity — whether the brand
            was named, where it ranked, how it was framed, and what was cited.
          </p>
        </header>

        <div className="space-y-4">
          <Filters
            value={draft}
            applied={applied}
            onChange={setDraft}
            onApply={apply}
            onReset={reset}
            onRemove={removeFilter}
            isRefreshing={refreshing}
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

function Mark() {
  return (
    <span
      className="grid h-8 w-8 place-items-center rounded-lg bg-forest text-[#e9efe9]"
      aria-hidden="true"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="1.8" fill="currentColor" />
        <path d="M4.4 4.4a5.1 5.1 0 0 0 0 7.2M11.6 4.4a5.1 5.1 0 0 1 0 7.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </span>
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

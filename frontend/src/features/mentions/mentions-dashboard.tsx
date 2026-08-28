"use client";

import { useState } from "react";
import { RadioTower } from "lucide-react";
import { Filters, type FilterDraft } from "./filters";
import { useMentionsQuery, useTrendsQuery } from "./hooks";
import { KpiSummary } from "./kpi-summary";
import { MentionsTable } from "./mentions-table";
import { DashboardSkeleton, EmptyState, ErrorState } from "./states";
import { TrendChart } from "./trend-chart";

const INITIAL_FILTERS: FilterDraft = { group_by: "day" };

export function MentionsDashboard() {
  const [draft, setDraft] = useState<FilterDraft>(INITIAL_FILTERS);
  const [applied, setApplied] = useState<FilterDraft>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const { group_by, ...mentionFilters } = applied;
  const mentions = useMentionsQuery(page, mentionFilters);
  const trends = useTrendsQuery({ date_from: applied.date_from, date_to: applied.date_to, group_by });

  const apply = () => { setApplied(draft); setPage(1); };
  const reset = () => { setDraft(INITIAL_FILTERS); setApplied(INITIAL_FILTERS); setPage(1); };
  const retry = () => { void mentions.refetch(); void trends.refetch(); };
  const initialLoading = !mentions.data && !trends.data && (mentions.isPending || trends.isPending);
  const refreshing = mentions.isFetching || trends.isFetching;

  return <main className="min-h-screen px-4 pb-12 pt-5 sm:px-6 sm:pt-8 lg:px-10">
    <div className="mx-auto max-w-[1480px]">
      <header className="mb-7 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-forest text-mint shadow-[0_8px_22px_rgba(23,61,43,.22)]"><RadioTower size={21} aria-hidden="true" /></span><div><p className="font-display text-sm font-extrabold tracking-tight">SIGNALDESK</p><p className="text-[.68rem] font-bold uppercase tracking-[.16em] text-[#7a827d]">AI visibility intelligence</p></div></div>
        <div className="hidden items-center gap-2 rounded-full border border-[#d8ddd7] bg-white/70 px-3 py-2 text-xs font-bold text-[#59635c] sm:flex"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#42aa6d] opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-[#35975d]" /></span>Live monitoring</div>
      </header>
      <section className="mb-6 max-w-3xl"><p className="mb-2 text-xs font-extrabold uppercase tracking-[.18em] text-coral">Brand intelligence</p><h1 className="font-display text-3xl font-extrabold leading-[1.06] tracking-[-.045em] sm:text-5xl">Know when your brand enters the answer.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#657069] sm:text-base">Track visibility, sentiment, and citations across the AI models shaping discovery.</p></section>
      <div className="space-y-4">
        <Filters value={draft} onChange={setDraft} onApply={apply} onReset={reset} isRefreshing={refreshing} />
        {initialLoading ? <DashboardSkeleton /> : mentions.error || trends.error ? <ErrorState onRetry={retry} /> : mentions.data && trends.data && mentions.data.data.length === 0 && trends.data.data.length === 0 ? <EmptyState onReset={reset} /> : mentions.data && trends.data ? <>
          <KpiSummary trends={trends.data.data} />
          <TrendChart data={trends.data.data} />
          {mentions.data.data.length ? <MentionsTable mentions={mentions.data.data} page={mentions.data.page} perPage={mentions.data.per_page} total={mentions.data.total} onPageChange={setPage} isRefreshing={mentions.isFetching} /> : <EmptyState onReset={reset} />}
        </> : null}
      </div>
    </div>
  </main>;
}

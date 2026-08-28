import type { FormEvent } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import type { GroupBy, MentionFilters, Model, Sentiment } from "./types";

export type FilterDraft = MentionFilters & { group_by: GroupBy };

interface FiltersProps {
  value: FilterDraft;
  onChange: (value: FilterDraft) => void;
  onApply: () => void;
  onReset: () => void;
  isRefreshing: boolean;
}

const controlClass = "h-11 w-full rounded-xl border border-[#cdd2cc] bg-white px-3 text-sm text-ink shadow-sm transition hover:border-[#91a398] focus:border-forest focus:outline-none";

export function Filters({ value, onChange, onApply, onReset, isRefreshing }: FiltersProps) {
  const invalidRange = Boolean(value.date_from && value.date_to && value.date_from > value.date_to);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!invalidRange) onApply(); };

  return (
    <Card className="relative overflow-hidden p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-10 -top-14 size-36 rounded-full bg-mint/35" />
      <form onSubmit={submit} aria-label="Mention filters" className="relative">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-[#e7f5ec] text-forest"><SlidersHorizontal size={16} aria-hidden="true" /></span>
          <div>
            <h2 className="font-display text-sm font-extrabold">Refine the signal</h2>
            <p className="text-xs text-[#667069]">Filters update after you apply them.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.05fr_1.05fr_.8fr_auto] lg:items-end">
          <label className="grid gap-1.5 text-xs font-bold text-[#58625b]">Model
            <select aria-label="Model" className={controlClass} value={value.model ?? ""} onChange={(event) => onChange({ ...value, model: (event.target.value || undefined) as Model | undefined })}>
              <option value="">All models</option><option value="chatgpt">ChatGPT</option><option value="claude">Claude</option><option value="gemini">Gemini</option><option value="perplexity">Perplexity</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-[#58625b]">Sentiment
            <select aria-label="Sentiment" className={controlClass} value={value.sentiment ?? ""} onChange={(event) => onChange({ ...value, sentiment: (event.target.value || undefined) as Sentiment | undefined })}>
              <option value="">All sentiment</option><option value="positive">Positive</option><option value="neutral">Neutral</option><option value="negative">Negative</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-[#58625b]">From
            <input aria-label="From" className={controlClass} type="date" value={value.date_from ?? ""} onChange={(event) => onChange({ ...value, date_from: event.target.value || undefined })} />
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-[#58625b]">To
            <input aria-label="To" className={controlClass} type="date" aria-describedby={invalidRange ? "date-error" : undefined} aria-invalid={invalidRange} value={value.date_to ?? ""} onChange={(event) => onChange({ ...value, date_to: event.target.value || undefined })} />
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-[#58625b]">Group by
            <select aria-label="Group by" className={controlClass} value={value.group_by} onChange={(event) => onChange({ ...value, group_by: event.target.value as GroupBy })}>
              <option value="day">Day</option><option value="week">Week</option>
            </select>
          </label>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
            <Button type="button" variant="secondary" className="flex-1 px-3 lg:flex-none" onClick={onReset}><RotateCcw size={15} aria-hidden="true" />Reset</Button>
            <Button type="submit" className="flex-1 lg:flex-none" disabled={invalidRange || isRefreshing}>{isRefreshing ? "Applying..." : "Apply"}</Button>
          </div>
        </div>
        {invalidRange && <p id="date-error" role="alert" className="mt-2 text-xs font-semibold text-[#b23e2a]">The end date must be on or after the start date.</p>}
      </form>
    </Card>
  );
}

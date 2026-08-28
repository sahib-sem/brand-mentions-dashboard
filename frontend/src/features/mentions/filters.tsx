"use client";

import { useState, type FormEvent } from "react";
import { ChevronDown, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Field, Input, Select } from "@/shared/ui/field";
import type { GroupBy, MentionFilters, Model, Sentiment } from "./types";

export type FilterDraft = MentionFilters & { group_by: GroupBy };
export const DATA_START = "2025-01-01";
export const DATA_END = "2025-03-30";

interface FiltersProps {
  value: FilterDraft;
  applied: FilterDraft;
  onChange: (value: FilterDraft) => void;
  onApply: () => void;
  onReset: () => void;
  onRemove: (key: keyof MentionFilters) => void;
  isRefreshing: boolean;
}

const MODELS: { value: Model; label: string }[] = [
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "perplexity", label: "Perplexity" },
];

const SENTIMENTS: Sentiment[] = ["positive", "neutral", "negative"];

export function Filters({
  value,
  applied,
  onChange,
  onApply,
  onReset,
  onRemove,
  isRefreshing,
}: FiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const invalidRange = Boolean(value.date_from && value.date_to && value.date_from > value.date_to);
  const dirty = JSON.stringify(value) !== JSON.stringify(applied);
  const chips = activeChips(applied);
  const hasAppliedFilters = chips.length > 0 || applied.group_by !== "day";
  const canReset = dirty || hasAppliedFilters;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!invalidRange) onApply();
  };

  return (
    <section className="border-b border-line pb-5">
      <form onSubmit={submit} aria-label="Mention filters">
        <div className="mb-4 flex items-center justify-between gap-3 sm:justify-start">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink sm:cursor-default"
            aria-expanded={mobileOpen}
            aria-controls="filter-fields"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filters
            {chips.length > 0 && (
              <span className="rounded-full bg-clay-soft px-2 py-0.5 text-xs font-semibold text-forest">
                {chips.length}
              </span>
            )}
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`transition-transform sm:hidden ${mobileOpen ? "rotate-180" : ""}`}
            />
          </button>
          {dirty && !invalidRange && (
            <span className="text-xs font-medium text-forest">Unapplied changes</span>
          )}
        </div>

        <div
          id="filter-fields"
          className={`${mobileOpen ? "grid" : "hidden"} gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-[1.1fr_1.1fr_1fr_1fr_.9fr_auto] lg:items-end`}
        >
          <Field label="Model">
            <Select
              aria-label="Model"
              value={value.model ?? ""}
              onChange={(event) =>
                onChange({ ...value, model: (event.target.value || undefined) as Model | undefined })
              }
            >
              <option value="">All models</option>
              {MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Sentiment">
            <Select
              aria-label="Sentiment"
              value={value.sentiment ?? ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  sentiment: (event.target.value || undefined) as Sentiment | undefined,
                })
              }
            >
              <option value="">All sentiment</option>
              {SENTIMENTS.map((sentiment) => (
                <option key={sentiment} value={sentiment} className="capitalize">
                  {sentiment[0].toUpperCase() + sentiment.slice(1)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="From">
            <Input
              aria-label="From"
              type="date"
              min={DATA_START}
              max={value.date_to && value.date_to < DATA_END ? value.date_to : DATA_END}
              value={value.date_from ?? ""}
              onChange={(event) => onChange({ ...value, date_from: event.target.value || undefined })}
            />
          </Field>

          <Field label="To">
            <Input
              aria-label="To"
              type="date"
              min={value.date_from && value.date_from > DATA_START ? value.date_from : DATA_START}
              max={DATA_END}
              aria-describedby={invalidRange ? "date-error" : undefined}
              aria-invalid={invalidRange}
              value={value.date_to ?? ""}
              onChange={(event) => onChange({ ...value, date_to: event.target.value || undefined })}
            />
          </Field>

          <Field label="Group by">
            <Select
              aria-label="Group by"
              value={value.group_by}
              onChange={(event) => onChange({ ...value, group_by: event.target.value as GroupBy })}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
            </Select>
          </Field>

          <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 lg:flex-none"
              onClick={onReset}
              disabled={!canReset || isRefreshing}
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reset
            </Button>
            <Button
              type="submit"
              className="flex-1 lg:flex-none"
              disabled={invalidRange || isRefreshing || !dirty}
            >
              {isRefreshing ? "Applying…" : "Apply"}
            </Button>
          </div>
        </div>

        {invalidRange && (
          <p id="date-error" role="alert" className="mt-2.5 text-xs font-semibold text-ember">
            The end date must be on or after the start date.
          </p>
        )}

        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3.5">
            <span className="font-mono text-[.65rem] uppercase tracking-[.12em] text-ink-3">
              Active
            </span>
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => onRemove(chip.key)}
                className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white py-1 pl-2.5 pr-2 text-xs font-medium text-ink-2 transition-colors hover:border-ember hover:text-ember"
              >
                <span className="text-ink-3 group-hover:text-ember">{chip.label}</span>
                <span className="font-semibold">{chip.display}</span>
                <X size={12} aria-hidden="true" />
                <span className="sr-only">Remove {chip.label} filter</span>
              </button>
            ))}
          </div>
        )}
      </form>
    </section>
  );
}

interface Chip {
  key: keyof MentionFilters;
  label: string;
  display: string;
}

function activeChips(filters: MentionFilters): Chip[] {
  const chips: Chip[] = [];
  if (filters.model) {
    const label = MODELS.find((model) => model.value === filters.model)?.label ?? filters.model;
    chips.push({ key: "model", label: "Model", display: label });
  }
  if (filters.sentiment) {
    chips.push({
      key: "sentiment",
      label: "Sentiment",
      display: filters.sentiment[0].toUpperCase() + filters.sentiment.slice(1),
    });
  }
  if (filters.date_from) chips.push({ key: "date_from", label: "From", display: filters.date_from });
  if (filters.date_to) chips.push({ key: "date_to", label: "To", display: filters.date_to });
  return chips;
}

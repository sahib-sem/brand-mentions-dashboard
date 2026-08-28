import type { FormEvent } from "react";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Field, Input, Select } from "@/shared/ui/field";
import type { GroupBy, MentionFilters, Model, Sentiment } from "./types";

export type FilterDraft = MentionFilters & { group_by: GroupBy };

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
  const invalidRange = Boolean(value.date_from && value.date_to && value.date_from > value.date_to);
  const dirty = JSON.stringify(value) !== JSON.stringify(applied);
  const chips = activeChips(applied);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!invalidRange) onApply();
  };

  return (
    <Card className="p-4 sm:p-5">
      <form onSubmit={submit} aria-label="Mention filters">
        <div className="mb-4 flex items-center gap-2 text-ink-2">
          <SlidersHorizontal size={15} aria-hidden="true" />
          <h2 className="font-mono text-[.7rem] font-medium uppercase tracking-[.16em]">
            Filters
          </h2>
          {dirty && !invalidRange && (
            <span className="rounded-full bg-clay-soft px-2 py-0.5 text-[.68rem] font-semibold text-clay">
              Unapplied changes
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.1fr_1fr_1fr_.9fr_auto] lg:items-end">
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
              max={value.date_to || undefined}
              value={value.date_from ?? ""}
              onChange={(event) => onChange({ ...value, date_from: event.target.value || undefined })}
            />
          </Field>

          <Field label="To">
            <Input
              aria-label="To"
              type="date"
              min={value.date_from || undefined}
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
            <Button type="button" variant="secondary" className="flex-1 lg:flex-none" onClick={onReset}>
              <RotateCcw size={14} aria-hidden="true" />
              Reset
            </Button>
            <Button type="submit" className="flex-1 lg:flex-none" disabled={invalidRange || isRefreshing}>
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
                className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-white py-1 pl-2.5 pr-2 text-xs font-medium text-ink-2 transition-colors hover:border-ember hover:text-ember"
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
    </Card>
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

import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, SectionHeading } from "@/shared/ui/card";
import { Select } from "@/shared/ui/field";
import { PER_PAGE_OPTIONS, type Mention } from "./types";

interface MentionsTableProps {
  mentions: Mention[];
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  isRefreshing: boolean;
}

const HEAD = "px-4 py-2.5 font-mono text-[.65rem] font-medium uppercase tracking-[.12em] text-ink-3";

export function MentionsTable({
  mentions,
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  isRefreshing,
}: MentionsTableProps) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = total ? (page - 1) * perPage + 1 : 0;
  const end = Math.min(page * perPage, total);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-4 py-4 sm:px-6 sm:py-5">
        <SectionHeading eyebrow="Records" title="Mention details">
          <p className="nums text-sm text-ink-3" aria-live="polite">
            <strong className="font-semibold text-ink">{total.toLocaleString()}</strong> matching
            {total === 1 ? " answer" : " answers"}
          </p>
        </SectionHeading>
      </div>

      <div className="relative" aria-busy={isRefreshing}>
        {isRefreshing && (
          <div className="absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden bg-transparent">
            <div className="bar-indeterminate h-full w-full bg-clay" />
          </div>
        )}
        <div
          className={`divide-y divide-line-soft transition-opacity duration-200 md:hidden ${isRefreshing ? "opacity-60" : ""}`}
        >
          {mentions.map((mention) => (
            <MobileMention key={mention.id} mention={mention} />
          ))}
        </div>
        <div className="scroll-x hidden max-h-[70vh] overflow-auto md:block">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Brand mentions matching the current filters, newest first.
          </caption>
          <thead className="sticky top-0 z-10 bg-paper/95 backdrop-blur">
            <tr className="border-b border-line">
              <th scope="col" className={`${HEAD} pl-5 sm:pl-6`}>
                Query
              </th>
              <th scope="col" className={HEAD}>
                Model
              </th>
              <th scope="col" className={HEAD}>
                Mentioned
              </th>
              <th scope="col" className={`${HEAD} text-right`}>
                Position
              </th>
              <th scope="col" className={HEAD}>
                Sentiment
              </th>
              <th scope="col" className={HEAD}>
                Citation
              </th>
              <th scope="col" className={`${HEAD} pr-5 text-right sm:pr-6`}>
                Date
              </th>
            </tr>
          </thead>
          <tbody className={`transition-opacity duration-200 ${isRefreshing ? "opacity-60" : ""}`}>
            {mentions.map((mention) => (
              <tr key={mention.id} className="border-b border-line-soft last:border-0 hover:bg-paper/70">
                <td className="max-w-[340px] py-3 pl-5 pr-4 sm:pl-6">
                  <span className="block truncate font-medium text-ink" title={mention.query_text}>
                    {mention.query_text}
                  </span>
                  <span className="font-mono text-[.68rem] text-ink-3">{mention.id}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-md border border-line bg-white px-2 py-0.5 text-xs font-medium capitalize text-ink-2">
                    {mention.model}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {mention.mentioned ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-moss">
                      <i className="h-1.5 w-1.5 rounded-full bg-moss" aria-hidden="true" />
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3">
                      <i className="h-1.5 w-1.5 rounded-full bg-sand" aria-hidden="true" />
                      No
                    </span>
                  )}
                </td>
                <td className="nums px-4 py-3 text-right font-mono text-[.8rem] text-ink-2">
                  {mention.position === null ? <Empty /> : `#${mention.position}`}
                </td>
                <td className="px-4 py-3">
                  <SentimentTag value={mention.sentiment} />
                </td>
                <td className="max-w-[190px] px-4 py-3">
                  {mention.citation_url ? (
                    <a
                      className="inline-flex max-w-full items-center gap-1 text-xs font-medium text-forest underline decoration-line underline-offset-4 hover:decoration-forest"
                      href={mention.citation_url}
                      target="_blank"
                      rel="noreferrer"
                      title={mention.citation_url}
                    >
                      <span className="truncate">{hostname(mention.citation_url)}</span>
                      <ExternalLink size={11} aria-hidden="true" className="shrink-0" />
                    </a>
                  ) : (
                    <Empty />
                  )}
                </td>
                <td className="nums whitespace-nowrap py-3 pl-4 pr-5 text-right font-mono text-[.8rem] text-ink-2 sm:pr-6">
                  {formatDate(mention.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <p className="nums text-xs text-ink-3">
            <strong className="font-semibold text-ink-2">
              {start.toLocaleString()}–{end.toLocaleString()}
            </strong>{" "}
            of {total.toLocaleString()}
          </p>
          <label className="flex items-center gap-2 text-xs text-ink-3">
            <span className="sr-only sm:not-sr-only">Rows</span>
            <Select
              aria-label="Rows per page"
              className="h-8 w-[4.75rem] py-0 text-xs"
              value={perPage}
              onChange={(event) => onPerPageChange(Number(event.target.value))}
            >
              {PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>
        </div>
        <div className="flex items-center justify-between gap-1.5 sm:justify-start">
          <Button
            variant="secondary"
            className="h-11 w-11 cursor-pointer p-0"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft size={21} strokeWidth={2.25} aria-hidden="true" />
          </Button>
          <p className="nums px-2 text-xs text-ink-2">
            Page <strong className="font-semibold text-ink">{page}</strong> of{" "}
            {pages.toLocaleString()}
          </p>
          <Button
            variant="secondary"
            className="h-11 w-11 cursor-pointer p-0"
            aria-label="Next page"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight size={21} strokeWidth={2.25} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function MobileMention({ mention }: { mention: Mention }) {
  return (
    <article className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-ink">
            {mention.query_text}
          </h3>
          <p className="nums mt-1 text-xs text-ink-3">{formatDate(mention.created_at)}</p>
        </div>
        <span className="shrink-0 rounded-md border border-line bg-paper px-2 py-0.5 text-xs font-medium capitalize text-ink-2">
          {mention.model}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {mention.mentioned ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-moss">
            <i className="h-1.5 w-1.5 rounded-full bg-moss" aria-hidden="true" />
            Mentioned
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
            <i className="h-1.5 w-1.5 rounded-full bg-sand" aria-hidden="true" />
            Not mentioned
          </span>
        )}
        <SentimentTag value={mention.sentiment} />
      </div>

      <details className="group mt-3">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-semibold text-forest">
          View details
          <ChevronDown
            size={15}
            aria-hidden="true"
            className="transition-transform group-open:rotate-180"
          />
        </summary>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-paper p-3 text-xs">
          <div>
            <dt className="text-ink-3">Position</dt>
            <dd className="nums mt-0.5 font-medium text-ink">
              {mention.position === null ? "Not available" : `#${mention.position}`}
            </dd>
          </div>
          <div>
            <dt className="text-ink-3">Record ID</dt>
            <dd className="mt-0.5 truncate font-mono text-ink">{mention.id}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-ink-3">Citation</dt>
            <dd className="mt-0.5">
              {mention.citation_url ? (
                <a
                  className="inline-flex max-w-full items-center gap-1 font-medium text-forest underline underline-offset-4"
                  href={mention.citation_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="truncate">{hostname(mention.citation_url)}</span>
                  <ExternalLink size={12} aria-hidden="true" className="shrink-0" />
                </a>
              ) : (
                "Not available"
              )}
            </dd>
          </div>
        </dl>
      </details>
    </article>
  );
}

const TONES: Record<string, string> = {
  positive: "bg-moss-soft text-moss",
  neutral: "bg-line-soft text-ink-2",
  negative: "bg-ember-soft text-ember",
};

function SentimentTag({ value }: { value: string | null }) {
  if (!value) return <Empty />;
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${TONES[value] ?? TONES.neutral}`}
    >
      {value}
    </span>
  );
}

function Empty() {
  return (
    <span className="text-ink-3" aria-label="Not available">
      —
    </span>
  );
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
}

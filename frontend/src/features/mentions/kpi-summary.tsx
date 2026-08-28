import type { TrendPoint } from "./types";

interface Metric {
  label: string;
  value: string;
  note: string;
  meter?: number;
}

export function KpiSummary({ trends, groupBy }: { trends: TrendPoint[]; groupBy: string }) {
  const total = trends.reduce((sum, point) => sum + point.total, 0);
  const mentioned = trends.reduce((sum, point) => sum + point.mentioned, 0);
  const rate = total ? (mentioned / total) * 100 : 0;
  const peak = trends.reduce((best, point) => (point.mentioned > best.mentioned ? point : best), {
    date: "",
    total: 0,
    mentioned: 0,
  });
  const bucket = groupBy === "week" ? "week" : "day";

  const metrics: Metric[] = [
    {
      label: "Responses tracked",
      value: total.toLocaleString(),
      note: `${trends.length.toLocaleString()} ${bucket}${trends.length === 1 ? "" : "s"} with activity`,
    },
    {
      label: "Brand mentions",
      value: mentioned.toLocaleString(),
      note: `${(total - mentioned).toLocaleString()} answers without the brand`,
    },
    {
      label: "Visibility rate",
      value: `${rate.toFixed(1)}%`,
      note: "Share of answers naming the brand",
      meter: rate,
    },
    {
      label: `Peak ${bucket}ly mentions`,
      value: peak.date ? peak.mentioned.toLocaleString() : "—",
      note: peak.date
        ? `${formatDate(peak.date)} · ${peak.total.toLocaleString()} answers`
        : "No activity yet",
    },
  ];

  return (
    <div className="overflow-hidden border-y border-line bg-surface">
      <div className="grid grid-cols-2 gap-px bg-line-soft lg:grid-cols-4">
        {metrics.map((metric) => (
          <section key={metric.label} aria-label={metric.label} className="bg-surface p-4 sm:p-5">
            <p className="font-mono text-[.65rem] font-medium uppercase tracking-[.13em] text-ink-3">
              {metric.label}
            </p>
            <p className="nums mt-2 text-[2rem] font-semibold leading-none tracking-[-.02em] sm:text-[2.25rem]">
              {metric.value}
            </p>
            {metric.meter === undefined ? null : (
              <div
                className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line-soft"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-clay transition-[width] duration-500"
                  style={{ width: `${Math.min(100, metric.meter)}%` }}
                />
              </div>
            )}
            <p className={`text-xs text-ink-3 ${metric.meter === undefined ? "mt-3" : "mt-2"}`}>
              {metric.note}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, SectionHeading } from "@/shared/ui/card";
import type { GroupBy, TrendPoint } from "./types";

const TOTAL = "#c9c0a9";
const MENTIONED = "#b4552f";

export function TrendChart({
  data,
  groupBy,
  scope,
}: {
  data: TrendPoint[];
  groupBy: GroupBy;
  scope: string;
}) {
  const format = (value: string) => formatBucket(value, groupBy);

  return (
    <Card className="min-w-0 p-4 sm:p-6">
      <SectionHeading eyebrow="Visibility trend" title="Share of the conversation">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-2">
          <Swatch color={TOTAL} label="All answers" />
          <Swatch color={MENTIONED} label="Brand mentioned" />
        </div>
      </SectionHeading>
      <p className="mt-1.5 text-sm text-ink-3">{scope}</p>

      {data.length === 0 ? (
        <div className="mt-5 grid h-[240px] place-items-center rounded-xl border border-dashed border-line bg-paper/60 text-sm text-ink-3">
          No activity in this range.
        </div>
      ) : (
        <div
          className="mt-5 h-[260px] w-full sm:h-[320px]"
          role="img"
          aria-label={`Area chart comparing all tracked answers with brand mentions per ${groupBy}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="fillMentioned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={MENTIONED} stopOpacity={0.24} />
                  <stop offset="100%" stopColor={MENTIONED} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e8e3d7" strokeDasharray="2 6" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={format}
                tick={{ fill: "#838b85", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={34}
                dy={6}
              />
              <YAxis
                allowDecimals={false}
                width={46}
                tick={{ fill: "#838b85", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: "#b4552f", strokeWidth: 1, strokeDasharray: "3 3" }}
                content={<TrendTooltip format={format} />}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="All answers"
                stroke={TOTAL}
                strokeWidth={1.5}
                fill={TOTAL}
                fillOpacity={0.3}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="mentioned"
                name="Brand mentioned"
                stroke={MENTIONED}
                strokeWidth={2}
                fill="url(#fillMentioned)"
                activeDot={{ r: 4, fill: MENTIONED, stroke: "#fdfbf6", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} aria-hidden="true" />
      {label}
    </span>
  );
}

interface TooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: { payload: TrendPoint }[];
  format: (value: string) => string;
}

function TrendTooltip({ active, label, payload, format }: TooltipProps) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  const rate = point.total ? Math.round((point.mentioned / point.total) * 100) : 0;

  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-3 text-xs shadow-[0_16px_36px_-20px_rgba(23,28,24,.5)]">
      <p className="font-mono text-[.65rem] uppercase tracking-[.12em] text-ink-3">
        {format(String(label))}
      </p>
      <dl className="mt-2 grid grid-cols-[auto_auto] gap-x-5 gap-y-1">
        <dt className="text-ink-2">All answers</dt>
        <dd className="nums text-right font-semibold">{point.total.toLocaleString()}</dd>
        <dt className="text-ink-2">Brand mentioned</dt>
        <dd className="nums text-right font-semibold text-clay">
          {point.mentioned.toLocaleString()}
        </dd>
        <dt className="border-t border-line-soft pt-1 text-ink-2">Visibility</dt>
        <dd className="nums border-t border-line-soft pt-1 text-right font-semibold">{rate}%</dd>
      </dl>
    </div>
  );
}

function formatBucket(value: string, groupBy: GroupBy) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  const formatted = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
  return groupBy === "week" ? `Week of ${formatted}` : formatted;
}

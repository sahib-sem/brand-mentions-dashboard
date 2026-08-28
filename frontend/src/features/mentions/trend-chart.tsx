"use client";

import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/shared/ui/card";
import type { TrendPoint } from "./types";

const formatDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
};

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return <Card className="min-w-0 p-4 sm:p-6">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[.14em] text-coral">Visibility trend</p><h2 className="font-display text-xl font-extrabold sm:text-2xl">Share of the conversation</h2></div>
      <div className="flex gap-4 text-xs font-semibold text-[#59635c]">
        <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-[#aeb8b1]" />Total responses</span>
        <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-coral" />Mentioned</span>
      </div>
    </div>
    {data.length ? <div className="h-[280px] w-full sm:h-[330px]" role="img" aria-label="Area chart comparing total model responses with brand mentions over time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <defs><linearGradient id="mentionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f17055" stopOpacity={0.28} /><stop offset="100%" stopColor="#f17055" stopOpacity={0.02} /></linearGradient></defs>
          <CartesianGrid stroke="#e6e8e3" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#778079", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={28} />
          <YAxis allowDecimals={false} tick={{ fill: "#778079", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip labelFormatter={(value) => formatDate(String(value))} contentStyle={{ border: "1px solid #dfe3de", borderRadius: 14, boxShadow: "0 10px 30px rgba(23,33,27,.1)", fontSize: 12 }} />
          <Area type="monotone" dataKey="mentioned" stroke="#f17055" strokeWidth={3} fill="url(#mentionFill)" activeDot={{ r: 5, fill: "#f17055", stroke: "white", strokeWidth: 2 }} />
          <Line type="monotone" dataKey="total" stroke="#8d9b92" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div> : <div className="grid h-[280px] place-items-center rounded-2xl border border-dashed border-[#d5dad4] bg-[#fafbf9] text-sm text-[#78817b]">No trend points for this range.</div>}
  </Card>;
}

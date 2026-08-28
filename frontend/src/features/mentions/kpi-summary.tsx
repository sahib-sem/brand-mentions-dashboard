import { Activity, Eye, Gauge, Sparkles } from "lucide-react";
import { Card } from "@/shared/ui/card";
import type { TrendPoint } from "./types";

export function KpiSummary({ trends }: { trends: TrendPoint[] }) {
  const total = trends.reduce((sum, point) => sum + point.total, 0);
  const mentioned = trends.reduce((sum, point) => sum + point.mentioned, 0);
  const rate = total ? Math.round((mentioned / total) * 100) : 0;
  const average = trends.length ? Math.round(mentioned / trends.length) : 0;
  const peak = trends.reduce((best, point) => point.mentioned > best.mentioned ? point : best, { date: "", total: 0, mentioned: 0 });
  const cards = [
    { label: "Responses tracked", value: total.toLocaleString(), note: `${trends.length} reporting periods`, icon: Activity, tone: "bg-[#e9f8ef] text-[#1f7046]" },
    { label: "Brand mentions", value: mentioned.toLocaleString(), note: "Explicit brand appearances", icon: Eye, tone: "bg-[#fff0eb] text-[#b64e37]" },
    { label: "Visibility rate", value: `${rate}%`, note: "Share of tracked responses", icon: Gauge, tone: "bg-[#edf1ff] text-[#5266af]" },
    { label: "Average signal", value: average.toLocaleString(), note: peak.date ? `Peak: ${formatShortDate(peak.date)}` : "No peak yet", icon: Sparkles, tone: "bg-[#fff7dc] text-[#9b7118]" },
  ];

  return <section aria-label="Visibility summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map(({ label, value, note, icon: Icon, tone }) => (
    <Card key={label} className="p-4 sm:p-5">
      <div className={`mb-4 grid size-9 place-items-center rounded-xl ${tone}`}><Icon size={18} aria-hidden="true" /></div>
      <p className="text-[.68rem] font-bold uppercase tracking-[.14em] text-[#6b746e]">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{value}</p>
      <p className="mt-1 truncate text-xs text-[#79817c]">{note}</p>
    </Card>
  ))}</section>;
}

function formatShortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

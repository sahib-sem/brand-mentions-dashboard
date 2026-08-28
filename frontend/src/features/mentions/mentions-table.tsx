import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import type { Mention } from "./types";

interface MentionsTableProps { mentions: Mention[]; page: number; perPage: number; total: number; onPageChange: (page: number) => void; isRefreshing: boolean; }

export function MentionsTable({ mentions, page, perPage, total, onPageChange, isRefreshing }: MentionsTableProps) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = total ? (page - 1) * perPage + 1 : 0;
  const end = Math.min(page * perPage, total);
  return <Card className="overflow-hidden">
    <div className="flex flex-wrap items-end justify-between gap-2 border-b border-black/7 px-4 py-5 sm:px-6">
      <div><p className="text-xs font-bold uppercase tracking-[.14em] text-coral">Mention explorer</p><h2 className="font-display text-xl font-extrabold sm:text-2xl">Every response, in context</h2></div>
      <p className="text-xs font-medium text-[#717a74]" aria-live="polite">{total.toLocaleString()} results</p>
    </div>
    <div className="overflow-x-auto" aria-busy={isRefreshing}>
      <table className={`w-full min-w-[1050px] border-collapse text-left text-sm transition-opacity ${isRefreshing ? "opacity-55" : ""}`}>
        <thead className="bg-[#f4f6f2] text-[.67rem] uppercase tracking-[.1em] text-[#67716a]"><tr>
          <th className="px-6 py-3 font-bold">Query</th><th className="px-4 py-3 font-bold">Model</th><th className="px-4 py-3 font-bold">Mentioned</th><th className="px-4 py-3 font-bold">Position</th><th className="px-4 py-3 font-bold">Sentiment</th><th className="px-4 py-3 font-bold">Citation</th><th className="px-6 py-3 font-bold">Date</th>
        </tr></thead>
        <tbody>{mentions.map((mention) => <tr key={mention.id} className="border-t border-black/6 hover:bg-[#fbfcfa]">
          <td className="max-w-[330px] px-6 py-4 font-semibold"><span className="line-clamp-2">{mention.query_text}</span></td>
          <td className="px-4 py-4"><span className="rounded-lg bg-[#edf1ee] px-2.5 py-1 text-xs font-bold capitalize text-[#465149]">{mention.model}</span></td>
          <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-bold ${mention.mentioned ? "text-[#26764b]" : "text-[#818a84]"}`}><i className={`size-2 rounded-full ${mention.mentioned ? "bg-[#35a86b]" : "bg-[#b6bdb8]"}`} />{mention.mentioned ? "Yes" : "No"}</span></td>
          <td className="px-4 py-4 tabular-nums text-[#5f6862]">{mention.position ?? "-"}</td>
          <td className="px-4 py-4"><Sentiment value={mention.sentiment} /></td>
          <td className="max-w-[180px] px-4 py-4">{mention.citation_url ? <a className="inline-flex max-w-full items-center gap-1 text-xs font-bold text-[#356a50] hover:underline" href={mention.citation_url} target="_blank" rel="noreferrer"><span className="truncate">View source</span><ExternalLink size={12} aria-hidden="true" /></a> : <span className="text-[#949b96]">-</span>}</td>
          <td className="whitespace-nowrap px-6 py-4 text-xs text-[#626b65]">{formatDate(mention.created_at)}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="flex items-center justify-between gap-3 border-t border-black/7 px-4 py-4 sm:px-6">
      <p className="text-xs text-[#717a74]">Showing <strong className="text-ink">{start}-{end}</strong> of <strong className="text-ink">{total.toLocaleString()}</strong></p>
      <div className="flex items-center gap-2"><Button variant="secondary" className="size-10 p-0" aria-label="Previous page" disabled={page <= 1 || isRefreshing} onClick={() => onPageChange(page - 1)}><ChevronLeft size={17} /></Button><span className="min-w-20 text-center text-xs font-bold">{page} / {pages}</span><Button variant="secondary" className="size-10 p-0" aria-label="Next page" disabled={page >= pages || isRefreshing} onClick={() => onPageChange(page + 1)}><ChevronRight size={17} /></Button></div>
    </div>
  </Card>;
}

function Sentiment({ value }: { value: string | null }) {
  if (!value) return <span className="text-[#949b96]">-</span>;
  const colors: Record<string, string> = { positive: "bg-[#e4f6eb] text-[#277148]", neutral: "bg-[#eef0ee] text-[#606963]", negative: "bg-[#ffebe6] text-[#a94935]" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${colors[value] ?? colors.neutral}`}>{value}</span>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
}

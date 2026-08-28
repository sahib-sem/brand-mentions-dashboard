import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function DashboardSkeleton() {
  return <div aria-label="Loading dashboard" role="status" className="space-y-4">
    <Skeleton className="h-36 w-full rounded-[1.35rem]" />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-36 rounded-[1.35rem]" />)}</div>
    <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]"><Skeleton className="h-[410px] rounded-[1.35rem]" /><Skeleton className="h-[410px] rounded-[1.35rem]" /></div>
  </div>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <Card className="grid min-h-[380px] place-items-center p-8 text-center" role="alert"><div><span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-[#ffebe6] text-[#b84f38]"><AlertTriangle /></span><h2 className="font-display text-xl font-extrabold">The signal dropped out</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#69726c]">We could not load your mentions. Check the API connection and try again.</p><Button className="mt-5" onClick={onRetry}>Try again</Button></div></Card>;
}

export function EmptyState({ onReset }: { onReset: () => void }) {
  return <Card className="grid min-h-[320px] place-items-center border-dashed p-8 text-center"><div><span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-[#e9f5ed] text-[#327452]"><Inbox /></span><h2 className="font-display text-xl font-extrabold">No signals in this slice</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#69726c]">Try widening the dates or clearing a model or sentiment filter.</p><Button variant="secondary" className="mt-5" onClick={onReset}>Clear filters</Button></div></Card>;
}

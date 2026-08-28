import { AlertTriangle, SearchX } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div aria-label="Loading dashboard" role="status" className="space-y-4">
      <Card className="overflow-hidden">
        <div className="grid grid-cols-2 gap-px bg-line-soft lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="bg-surface p-5">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="mt-3 h-8 w-20" />
              <Skeleton className="mt-3 h-2.5 w-32" />
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="mt-2 h-6 w-64" />
        <Skeleton className="mt-6 h-[260px] w-full sm:h-[320px]" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="mt-2 h-6 w-56" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      </Card>
      <span className="sr-only">Loading brand mention data</span>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="grid min-h-[360px] place-items-center p-8 text-center" role="alert">
      <div className="max-w-md">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-ember-soft text-ember">
          <AlertTriangle size={20} aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold">The signal dropped out</h2>
        <p className="mt-2 text-sm leading-6 text-ink-2">
          We couldn&apos;t reach the mentions API. This is usually a cold start on the API host — give
          it a moment and try again.
        </p>
        <Button className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </Card>
  );
}

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Card className="grid min-h-[320px] place-items-center border-dashed p-8 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-line-soft text-ink-2">
          <SearchX size={20} aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold">No signals in this slice</h2>
        <p className="mt-2 text-sm leading-6 text-ink-2">
          Nothing matched these filters. Try widening the dates, or drop the model or sentiment
          constraint.
        </p>
        <Button variant="secondary" className="mt-5" onClick={onReset}>
          Clear filters
        </Button>
      </div>
    </Card>
  );
}

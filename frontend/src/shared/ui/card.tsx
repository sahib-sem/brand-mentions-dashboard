import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface shadow-sm ${className}`}
      {...props}
    />
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[.08em] text-ink-3">
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-1 text-xl font-semibold tracking-[-.01em] sm:text-2xl">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

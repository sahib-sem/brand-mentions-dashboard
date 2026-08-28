import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(23,28,24,.04),0_12px_28px_-18px_rgba(23,28,24,.28)] ${className}`}
      {...props}
    />
  );
}

/** Small caps eyebrow used above every section heading. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[.68rem] font-medium uppercase tracking-[.16em] text-clay">
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
        <h2 className="mt-1 font-display text-xl font-semibold tracking-[-.01em] sm:text-[1.6rem]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

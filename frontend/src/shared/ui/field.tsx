import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const control =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink transition-colors " +
  "hover:border-ink-3 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15";

const labelText = "font-mono text-[.68rem] font-medium uppercase tracking-[.12em] text-ink-3";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className={labelText}>{label}</span>
      {children}
    </label>
  );
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${control} control-select ${className}`} {...props} />;
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${control} nums ${className}`} {...props} />;
}

import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-[1.35rem] border border-black/8 bg-white/90 shadow-[0_14px_40px_rgba(32,48,38,.06)] ${className}`} {...props} />;
}

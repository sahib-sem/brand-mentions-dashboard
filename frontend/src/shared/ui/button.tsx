import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary:
    "bg-forest text-[#f4f2ea] hover:bg-forest-hi active:bg-forest shadow-[0_1px_2px_rgba(20,58,43,.3)]",
  secondary:
    "border border-line bg-surface text-ink-2 hover:border-ink-3 hover:text-ink hover:bg-white",
  ghost: "text-ink-2 hover:bg-line-soft hover:text-ink",
} as const;

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

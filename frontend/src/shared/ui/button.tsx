import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" };

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-forest text-white hover:bg-[#24563e] shadow-[0_5px_14px_rgba(23,61,43,.18)]",
    secondary: "border border-[#c9cec8] bg-white text-ink hover:border-forest hover:bg-[#f8faf8]",
    ghost: "text-forest hover:bg-[#e8eee9]",
  };
  return <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`} {...props} />;
}

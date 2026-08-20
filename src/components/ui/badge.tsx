import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "secondary";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variants = {
    default: "border-transparent bg-[#c85b3a] text-white",
    outline: "border-white/20 text-[#c2bab0]",
    secondary: "border-transparent bg-white/10 text-[#c2bab0]",
  };

  return (
    <div className={cn(base, variants[variant], className)} {...props} />
  );
}

export { Badge };

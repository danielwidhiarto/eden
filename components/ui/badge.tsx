import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "focus";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-eden-bg-subtle text-eden-text-secondary",
        variant === "success" && "bg-green-100 text-green-700",
        variant === "warning" && "bg-amber-100 text-amber-700",
        variant === "error" && "bg-red-100 text-red-700",
        variant === "focus" && "bg-eden-focus-soft text-eden-focus",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

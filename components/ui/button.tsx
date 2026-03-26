import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all",
          "focus:outline-none focus:ring-2 focus:ring-eden-accent focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Variants
          variant === "primary" && [
            "bg-eden-text text-white",
            "hover:bg-eden-text/90",
          ],
          variant === "secondary" && [
            "bg-eden-surface border border-eden-border text-eden-text",
            "hover:bg-eden-bg-subtle hover:border-eden-border-strong",
          ],
          variant === "ghost" && [
            "text-eden-text-secondary",
            "hover:bg-eden-bg-subtle hover:text-eden-text",
          ],
          variant === "danger" && [
            "bg-red-600 text-white",
            "hover:bg-red-700",
          ],
          // Sizes
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-4 text-sm",
          size === "lg" && "h-12 px-6 text-base",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

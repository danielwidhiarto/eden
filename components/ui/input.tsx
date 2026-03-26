import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full rounded-lg border border-eden-border bg-eden-surface px-4 py-2.5",
          "text-eden-text placeholder:text-eden-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-eden-accent focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-eden-border bg-eden-surface px-4 py-2.5",
          "text-eden-text placeholder:text-eden-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-eden-accent focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "resize-none",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

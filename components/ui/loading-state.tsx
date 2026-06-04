import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface LoadingStateProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function LoadingState({ size = "md", label, className }: LoadingStateProps) {
  const iconSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";
  const padding = size === "sm" ? "py-2" : size === "lg" ? "py-12" : "py-8";

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", padding, className)}>
      <Loader2 className={cn(iconSize, "text-eden-text-muted animate-spin")} />
      {label && <p className="text-eden-text-muted text-sm">{label}</p>}
    </div>
  );
}

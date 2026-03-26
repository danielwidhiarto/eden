import { cn } from "@/lib/utils/cn";

export interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md";
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
}

export function Progress({ 
  value, 
  max = 100, 
  size = "md",
  variant = "default",
  className 
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div 
      className={cn(
        "w-full rounded-full bg-eden-bg-subtle overflow-hidden",
        size === "sm" && "h-1.5",
        size === "md" && "h-2",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          variant === "default" && "bg-eden-accent",
          variant === "success" && "bg-green-500",
          variant === "warning" && "bg-amber-500",
          variant === "error" && "bg-red-500",
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

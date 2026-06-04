import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12 px-4", className)}>
      {icon && (
        <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-eden-bg-subtle flex items-center justify-center text-eden-text-muted">
          {icon}
        </div>
      )}
      <p className="text-eden-text font-medium">{title}</p>
      {description && (
        <p className="text-eden-text-muted text-sm mt-1 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

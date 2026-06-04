"use client";

import { Card, CardContent } from "@/components/ui";
import { useTasks } from "@/lib/hooks";
import { cn } from "@/lib/utils/cn";
import { getDueMoment } from "@/lib/utils/task-due";

interface MetricCardProps {
  value: string | number;
  label: string;
  tone?: "default" | "warning" | "success";
}

function MetricCard({ value, label, tone = "default" }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="py-5 text-center">
        <p
          className={cn(
            "text-3xl font-semibold",
            tone === "warning" && value !== 0 && "text-red-600",
            tone === "success" && "text-eden-accent",
            tone === "default" && "text-eden-text"
          )}
        >
          {value}
        </p>
        <p className="text-eden-text-muted text-sm mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

export function MetricsRow() {
  const { backlogTasks, todoTasks, doingTasks, doneTasks } = useTasks();

  const activeCount = backlogTasks.length + todoTasks.length + doingTasks.length;
  const overdueCount = [...backlogTasks, ...todoTasks, ...doingTasks].filter((t) => {
    const due = getDueMoment(t);
    if (!due) return false;
    // eslint-disable-next-line react-hooks/purity
    return due.getTime() < Date.now();
  }).length;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <MetricCard value={activeCount} label="Active" />
      <MetricCard
        value={overdueCount}
        label="Overdue"
        tone={overdueCount > 0 ? "warning" : "default"}
      />
      <MetricCard value={doneTasks.length} label="Completed" tone="success" />
    </div>
  );
}

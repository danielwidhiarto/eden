"use client";

import { Card, CardContent } from "@/components/ui";
import { useTasks } from "@/lib/hooks";

interface MetricCardProps {
  value: string | number;
  label: string;
}

function MetricCard({ value, label }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="py-5 text-center">
        <p className="text-3xl font-semibold text-eden-text">{value}</p>
        <p className="text-eden-text-muted text-sm mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

export function MetricsRow() {
  const { tasks, doneTasks } = useTasks();
  
  const todayTasks = tasks.filter(t => t.status !== "done").length;
  const thisWeekDone = doneTasks.length;
  const weeklyProgress = tasks.length > 0 
    ? Math.round((doneTasks.length / tasks.length) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <MetricCard value={todayTasks} label="Tasks Pending" />
      <MetricCard value={thisWeekDone} label="Completed" />
      <MetricCard value={`${weeklyProgress}%`} label="Progress" />
    </div>
  );
}

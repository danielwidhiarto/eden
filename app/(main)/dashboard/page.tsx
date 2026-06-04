import {
  DateHeader,
  StateOfDay,
  TodayFocus,
  MetricsRow,
  KanbanBoard,
  WeeklyGoal,
} from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <div>
      <DateHeader />
      <StateOfDay />
      <TodayFocus />
      <MetricsRow />
      <KanbanBoard />
      <WeeklyGoal />
    </div>
  );
}

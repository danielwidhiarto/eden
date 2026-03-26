import {
  DateHeader,
  StateOfDay,
  TodayFocus,
  MetricsRow,
  KanbanBoard,
  WeeklyGoal,
  QuickNote,
} from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <div>
      <DateHeader />
      <StateOfDay />
      <TodayFocus />
      <MetricsRow />
      <KanbanBoard />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeeklyGoal />
        <QuickNote />
      </div>
    </div>
  );
}

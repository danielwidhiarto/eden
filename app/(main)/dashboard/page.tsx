import {
  DateHeader,
  StateOfDay,
  TodayFocus,
  MetricsRow,
  KanbanBoard,
} from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <div>
      <DateHeader />
      <StateOfDay />
      <TodayFocus />
      <MetricsRow />
      <KanbanBoard />
    </div>
  );
}

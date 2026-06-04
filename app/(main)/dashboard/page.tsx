import {
  DateHeader,
  TodayFocus,
  MetricsRow,
  KanbanBoard,
} from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <div>
      <DateHeader />
      <TodayFocus />
      <MetricsRow />
      <KanbanBoard />
    </div>
  );
}

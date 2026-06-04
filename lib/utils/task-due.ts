import { Timestamp } from "firebase/firestore";
import { format, isToday, isTomorrow, endOfDay } from "date-fns";
import type { Task } from "@/lib/types";

export type DueTone = "muted" | "today" | "overdue";

export interface DueInfo {
  label: string;
  tone: DueTone;
}

// Parse "HH:mm" → { hours, minutes } or null
function parseTime(time: string | null | undefined): { hours: number; minutes: number } | null {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return { hours: h, minutes: m };
}

// Returns the actual due moment for a task, taking optional dueTime into account.
// Without a time, treats the due date as end-of-day (so a task "due today" is
// not flagged overdue until the day ends).
export function getDueMoment(task: Pick<Task, "dueDate" | "dueTime">): Date | null {
  if (!task.dueDate) return null;
  const base = task.dueDate instanceof Timestamp ? task.dueDate.toDate() : new Date(task.dueDate);
  const time = parseTime(task.dueTime);
  if (time) {
    const d = new Date(base);
    d.setHours(time.hours, time.minutes, 0, 0);
    return d;
  }
  return endOfDay(base);
}

export function formatDueInfo(task: Pick<Task, "dueDate" | "dueTime">): DueInfo | null {
  if (!task.dueDate) return null;
  const base = task.dueDate instanceof Timestamp ? task.dueDate.toDate() : new Date(task.dueDate);
  const hasTime = !!parseTime(task.dueTime);
  const time = parseTime(task.dueTime);
  const now = new Date();
  const dueMoment = getDueMoment(task);

  // Overdue: now is past the due moment, AND the day is not today
  // (a task due "today 14:00" is only overdue after 14:00)
  if (dueMoment && dueMoment < now && !isToday(base)) {
    return {
      label: hasTime
        ? `Overdue · ${format(base, "MMM d, h:mm a")}`
        : `Overdue · ${format(base, "MMM d")}`,
      tone: "overdue",
    };
  }

  // Also overdue if today AND past the time
  if (isToday(base) && dueMoment && dueMoment < now) {
    return {
      label: hasTime
        ? `Overdue · ${format(base, "h:mm a")}`
        : "Overdue today",
      tone: "overdue",
    };
  }

  if (isToday(base)) {
    if (time) {
      return { label: `Today · ${format(base, "h:mm a")}`, tone: "today" };
    }
    return { label: "Due today", tone: "today" };
  }

  if (isTomorrow(base)) {
    if (time) {
      return { label: `Tomorrow · ${format(base, "h:mm a")}`, tone: "today" };
    }
    return { label: "Due tomorrow", tone: "today" };
  }

  return {
    label: hasTime ? format(base, "MMM d, h:mm a") : format(base, "MMM d"),
    tone: "muted",
  };
}

// Build/parse helpers for <input type="date"> and <input type="time">
export function toDateInputValue(value: Task["dueDate"]): string {
  if (!value) return "";
  const date = value instanceof Timestamp ? value.toDate() : new Date(value);
  return format(date, "yyyy-MM-dd");
}

export function toTimeInputValue(task: Pick<Task, "dueTime">): string {
  return task.dueTime ?? "";
}

// Combine a date string ("YYYY-MM-DD") and optional time string ("HH:mm")
// into a Timestamp. If no time, stores at noon (stable point for date-only
// tasks; overdue semantics are handled by getDueMoment/formatDueInfo).
export function buildDueTimestamp(dateStr: string, timeStr: string | null): Timestamp {
  const [year, month, day] = dateStr.split("-").map(Number);
  const time = parseTime(timeStr);
  if (time) {
    return Timestamp.fromDate(new Date(year, month - 1, day, time.hours, time.minutes, 0, 0));
  }
  // Date-only → store at noon local time. This is just a stable anchor point;
  // display/overdue logic uses getDueMoment which treats date-only as end-of-day.
  return Timestamp.fromDate(new Date(year, month - 1, day, 12, 0, 0, 0));
}

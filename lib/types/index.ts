import type { Timestamp } from "firebase/firestore";

// Task types
export type TaskStatus = "backlog" | "todo" | "doing" | "done" | "archived";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Timestamp;
  // Optional time of day in "HH:mm" 24h format. Combined with dueDate
  // for accurate overdue semantics. Omit for date-only tasks.
  dueTime?: string;
  scheduledDate?: Timestamp;
  goalId?: string;
  isFocus: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  archivedAt?: Timestamp;
}

// Goal types
export type GoalType = "monthly" | "weekly";
export type GoalStatus = "active" | "completed" | "archived";

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: GoalType;
  parentId?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  progress: number;
  status: GoalStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// KPI types
export type KPIType = "number" | "percentage" | "boolean" | "score";

export interface KPIScoreRange {
  min: number;
  max: number;
  score: number;
}

export interface KPI {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: KPIType;
  category?: string;
  
  // For number type
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  
  // For percentage type
  targetPercentage?: number;
  currentPercentage?: number;
  
  // For boolean type
  isCompleted?: boolean;
  
  // For score type
  currentScore?: number;
  maxScore?: number;
  scoreRanges?: KPIScoreRange[];
  
  // Weight for overall calculation
  weight: number;
  
  year: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User types
export interface UserSettings {
  focusHoursStart: number;
  focusHoursEnd: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  settings: UserSettings;
}

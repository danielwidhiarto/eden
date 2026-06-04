"use client";

import { useState } from "react";
import {
  Plus,
  Circle,
  CheckCircle2,
  Flame,
  Calendar,
  Trash2,
  Pencil,
  X,
  Check,
  AlertCircle,
  Archive,
  ArchiveRestore,
  Clock,
} from "lucide-react";
import { Card, CardContent, Button, Badge, Input, EmptyState, LoadingState } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useTasks } from "@/lib/hooks";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";
import {
  formatDueInfo,
  toDateInputValue,
  toTimeInputValue,
  buildDueTimestamp,
} from "@/lib/utils/task-due";

type FilterTab = "all" | "done" | "archived";

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  doing: "In Progress",
  done: "Done",
  archived: "Archived",
};

const PRIORITY_VARIANT: Record<TaskPriority, "default" | "warning" | "error"> = {
  low: "default",
  medium: "warning",
  high: "error",
};

interface EditFormState {
  title: string;
  dueDate: string;
  dueTime: string;
  priority: TaskPriority;
  status: TaskStatus;
}

export default function TasksPage() {
  const {
    tasks,
    archivedTasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    setFocusTask,
    archiveTask,
    unarchiveTask,
  } = useTasks();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    dueDate: "",
    dueTime: "",
    priority: "medium",
    status: "backlog",
  });

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "done", label: "Done" },
    { id: "archived", label: "Archived" },
  ];

  const filteredTasks = (() => {
    if (activeTab === "archived") return archivedTasks;
    const list = activeTab === "done" ? tasks.filter((t) => t.status === "done") : tasks;
    return list;
  })();

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await addTask({ title: newTaskTitle.trim(), status: "backlog" });
    setNewTaskTitle("");
    setShowAddTask(false);
  };

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      dueDate: toDateInputValue(task.dueDate),
      dueTime: toTimeInputValue(task),
      priority: task.priority,
      status: task.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.title.trim()) return;
    const updates: Partial<Task> = {
      title: editForm.title.trim(),
      priority: editForm.priority,
      status: editForm.status,
    };
    if (editForm.dueDate) {
      updates.dueDate = buildDueTimestamp(editForm.dueDate, editForm.dueTime || null);
      updates.dueTime = editForm.dueTime || undefined;
    } else {
      updates.dueDate = undefined;
      updates.dueTime = undefined;
    }
    await updateTask(editingId, updates);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (task: Task) => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  if (loading) {
    return <LoadingState size="lg" label="Loading tasks..." className="py-12" />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-eden-text">Tasks</h1>
        <Button onClick={() => setShowAddTask(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex gap-2">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTask();
                  if (e.key === "Escape") setShowAddTask(false);
                }}
                autoFocus
              />
              <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
                Add
              </Button>
              <Button variant="ghost" onClick={() => setShowAddTask(false)}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-eden-text-muted mt-2">
              New tasks start in <span className="font-medium">Backlog</span>. Drag them in the board to move them forward.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-eden-surface border border-eden-border text-eden-text"
                : "text-eden-text-secondary hover:bg-eden-surface hover:text-eden-text"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={
            activeTab === "archived" ? (
              <Archive className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )
          }
          title={
            activeTab === "archived"
              ? "No archived tasks"
              : activeTab === "done"
                ? "No completed tasks yet"
                : "No tasks yet"
          }
          description={
            activeTab === "archived"
              ? "Done tasks older than 6 months are archived automatically."
              : "Click 'New Task' to add your first one."
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const dueInfo = formatDueInfo(task);
            const isArchived = !!task.archivedAt;
            return (
              <Card key={task.id} className="group">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() =>
                        updateTask(task.id, {
                          status: task.status === "done" ? "todo" : "done",
                        })
                      }
                      disabled={isArchived}
                      className="mt-0.5 flex-shrink-0 disabled:opacity-50"
                      aria-label={task.status === "done" ? "Mark as not done" : "Mark as done"}
                    >
                      {task.status === "done" ? (
                        <CheckCircle2 className="w-5 h-5 text-eden-accent" />
                      ) : (
                        <Circle className="w-5 h-5 text-eden-text-muted hover:text-eden-accent transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      {editingId === task.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, title: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit();
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            className="h-8"
                            autoFocus
                          />
                          <div className="flex flex-wrap gap-2">
                            <select
                              value={editForm.status}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  status: e.target.value as TaskStatus,
                                }))
                              }
                              className="h-8 px-2 rounded-lg border border-eden-border bg-eden-surface text-sm text-eden-text"
                            >
                              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                                <option key={s} value={s}>
                                  {STATUS_LABELS[s]}
                                </option>
                              ))}
                            </select>
                            <select
                              value={editForm.priority}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  priority: e.target.value as TaskPriority,
                                }))
                              }
                              className="h-8 px-2 rounded-lg border border-eden-border bg-eden-surface text-sm text-eden-text"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                            <input
                              type="date"
                              value={editForm.dueDate}
                              onChange={(e) =>
                                setEditForm((f) => ({ ...f, dueDate: e.target.value }))
                              }
                              className="h-8 px-2 rounded-lg border border-eden-border bg-eden-surface text-sm text-eden-text"
                            />
                            <label className="flex items-center gap-1.5 text-xs text-eden-text-muted">
                              <Clock className="w-3.5 h-3.5" />
                              <input
                                type="time"
                                value={editForm.dueTime}
                                onChange={(e) =>
                                  setEditForm((f) => ({ ...f, dueTime: e.target.value }))
                                }
                                disabled={!editForm.dueDate}
                                className="h-8 px-2 rounded-lg border border-eden-border bg-eden-surface text-sm text-eden-text disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <span className="hidden sm:inline">optional</span>
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleSaveEdit} size="sm">
                              <Check className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button onClick={handleCancelEdit} variant="ghost" size="sm">
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={cn(
                              "text-eden-text",
                              task.status === "done" && "line-through text-eden-text-muted"
                            )}
                          >
                            {task.title}
                          </p>
                          {task.isFocus && (
                            <Flame className="w-4 h-4 text-eden-focus flex-shrink-0" />
                          )}
                          <Badge variant={PRIORITY_VARIANT[task.priority]} className="capitalize">
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-eden-text-muted bg-eden-bg-subtle px-2 py-0.5 rounded">
                            {STATUS_LABELS[task.status]}
                          </span>
                        </div>
                      )}

                      {editingId !== task.id && dueInfo && (
                        <div
                          className={cn(
                            "flex items-center gap-1 mt-1.5 text-xs",
                            dueInfo.tone === "overdue" && "text-red-600 font-medium",
                            dueInfo.tone === "today" && "text-amber-600",
                            dueInfo.tone === "muted" && "text-eden-text-muted"
                          )}
                        >
                          {dueInfo.tone === "overdue" ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <Calendar className="w-3 h-3" />
                          )}
                          <span>{dueInfo.label}</span>
                        </div>
                      )}

                      {!isArchived && (
                        <div className="flex items-center gap-3 mt-2">
                          {!task.isFocus &&
                            task.status !== "done" && (
                              <button
                                onClick={() => setFocusTask(task.id)}
                                className="text-xs text-eden-text-muted hover:text-eden-focus transition-colors"
                              >
                                Set as focus
                              </button>
                            )}
                          {task.status === "done" && (
                            <button
                              onClick={() => archiveTask(task.id)}
                              className="text-xs text-eden-text-muted hover:text-eden-text transition-colors"
                            >
                              <Archive className="w-3 h-3 inline mr-1" />
                              Archive
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isArchived && (
                        <button
                          onClick={() => handleStartEdit(task)}
                          className="p-1.5 text-eden-text-muted hover:text-eden-text hover:bg-eden-bg-subtle rounded"
                          aria-label="Edit task"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {isArchived ? (
                        <button
                          onClick={() => unarchiveTask(task.id)}
                          className="p-1.5 text-eden-text-muted hover:text-eden-accent hover:bg-eden-accent-soft rounded"
                          aria-label="Unarchive task"
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(task)}
                          className="p-1.5 text-eden-text-muted hover:text-red-500 hover:bg-red-50 rounded"
                          aria-label="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

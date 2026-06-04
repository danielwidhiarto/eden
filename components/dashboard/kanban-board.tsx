"use client";

import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Flame,
  GripVertical,
  Trash2,
  Pencil,
  X,
  Check,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, Button, Badge, Input, LoadingState } from "@/components/ui";
import { useTasks } from "@/lib/hooks";
import type { TaskStatus, Task, TaskPriority } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { formatDueInfo } from "@/lib/utils/task-due";

const PRIORITY_DOT: Record<TaskPriority, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-eden-text-muted",
};

interface SortableTaskProps {
  task: Task;
  onSetFocus: (taskId: string) => void;
  onDelete: (task: Task) => void;
  onEdit: (taskId: string, title: string) => void;
}

function SortableTask({ task, onSetFocus, onDelete, onEdit }: SortableTaskProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onEdit(task.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const dueInfo = formatDueInfo(task);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-white border border-eden-border rounded-lg p-3 hover:border-eden-border-strong hover:shadow-sm transition-all",
        isDragging && "opacity-50 shadow-lg border-eden-accent"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-0.5 flex-shrink-0 touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-eden-text-muted opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex gap-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="h-7 text-sm py-0"
                autoFocus
              />
              <button onClick={handleSaveEdit} className="p-1 text-eden-accent hover:bg-eden-accent-soft rounded">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={handleCancelEdit} className="p-1 text-eden-text-muted hover:bg-eden-bg-subtle rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-1.5">
              <span
                className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", PRIORITY_DOT[task.priority])}
                aria-label={`${task.priority} priority`}
              />
              <p className="text-sm text-eden-text break-words">{task.title}</p>
            </div>
          )}

          {dueInfo && !isEditing && (
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

          <div className="flex items-center gap-2 mt-2">
            {task.isFocus ? (
              <Badge variant="focus">
                <Flame className="w-3 h-3 mr-1" />
                Focus
              </Badge>
            ) : task.status !== "done" && task.status !== "archived" && (
              <button
                onClick={() => onSetFocus(task.id)}
                className="text-xs text-eden-text-muted hover:text-eden-focus transition-colors"
              >
                Set focus
              </button>
            )}
            <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-eden-text-muted hover:text-eden-text hover:bg-eden-bg-subtle rounded"
                aria-label="Edit task"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => onDelete(task)}
                className="p-1 text-eden-text-muted hover:text-red-500 hover:bg-red-50 rounded"
                aria-label="Delete task"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskOverlay({ task }: { task: Task }) {
  return (
    <div className="bg-white border-2 border-eden-accent rounded-lg p-3 shadow-xl rotate-3">
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-eden-accent mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-eden-text font-medium">{task.title}</p>
          {task.isFocus && (
            <Badge variant="focus" className="mt-2">
              <Flame className="w-3 h-3 mr-1" />
              Focus
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onSetFocus: (taskId: string) => void;
  onDelete: (task: Task) => void;
  onEdit: (taskId: string, title: string) => void;
}

function KanbanColumn({ id, title, tasks, onSetFocus, onDelete, onEdit }: KanbanColumnProps) {
  const { setNodeRef } = useSortable({
    id,
    data: { type: "column" },
  });

  return (
    <div className="flex-1 min-w-[220px]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-eden-text">{title}</h4>
        <span className="text-xs text-eden-text-muted bg-eden-bg-subtle px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="space-y-2 min-h-[150px] p-2 -m-2 rounded-lg transition-colors"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              onSetFocus={onSetFocus}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-[100px] border-2 border-dashed border-eden-border rounded-lg flex items-center justify-center">
            <p className="text-xs text-eden-text-muted">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const {
    loading,
    backlogTasks,
    todoTasks,
    doingTasks,
    doneTasks,
    addTask,
    setFocusTask,
    updateTask,
    deleteTask,
  } = useTasks();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await addTask({ title: newTaskTitle.trim(), status: "backlog" });
    setNewTaskTitle("");
    setShowAddTask(false);
  };

  const handleDeleteTask = (task: Task) => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  const handleEditTask = async (taskId: string, title: string) => {
    await updateTask(taskId, { title });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = [...backlogTasks, ...todoTasks, ...doingTasks, ...doneTasks].find(
      (t) => t.id === event.active.id
    );
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    let newStatus: TaskStatus | null = null;
    if (["backlog", "todo", "doing", "done"].includes(overId)) {
      newStatus = overId as TaskStatus;
    } else {
      const overTask = [...backlogTasks, ...todoTasks, ...doingTasks, ...doneTasks].find(
        (t) => t.id === overId
      );
      if (overTask) newStatus = overTask.status;
    }

    if (newStatus) {
      const task = [...backlogTasks, ...todoTasks, ...doingTasks, ...doneTasks].find(
        (t) => t.id === activeId
      );
      if (task && task.status !== newStatus) {
        await updateTask(activeId, {
          status: newStatus,
          completedAt: newStatus === "done" ? Timestamp.now() : undefined,
        });
      }
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent>
          <LoadingState size="lg" label="Loading tasks..." />
        </CardContent>
      </Card>
    );
  }

  const columns: { id: TaskStatus; title: string; tasks: Task[] }[] = [
    { id: "backlog", title: "Backlog", tasks: backlogTasks },
    { id: "todo", title: "Todo", tasks: todoTasks },
    { id: "doing", title: "Doing", tasks: doingTasks },
    { id: "done", title: "Done", tasks: doneTasks },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="py-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-eden-text-secondary uppercase tracking-wide">
            Today&apos;s Board
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setShowAddTask(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        </div>

        {showAddTask && (
          <div className="mb-4 flex gap-2">
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
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-2">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={column.tasks}
                onSetFocus={setFocusTask}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && <TaskOverlay task={activeTask} />}
          </DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  );
}

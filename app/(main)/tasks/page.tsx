"use client";

import { useState } from "react";
import { Plus, Circle, CheckCircle2, Flame, Calendar, Trash2, Pencil, X, Check, Loader2 } from "lucide-react";
import { Card, CardContent, Button, Badge, Input } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useTasks } from "@/lib/hooks";
import type { Task } from "@/lib/types";

type FilterTab = "all" | "today" | "upcoming" | "done";

export default function TasksPage() {
  const { tasks, loading, addTask, updateTask, deleteTask, toggleTaskStatus, setFocusTask } = useTasks();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "today", label: "Active" },
    { id: "done", label: "Done" },
  ];

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === "done") return task.status === "done";
    if (activeTab === "today") return task.status !== "done";
    return true;
  });

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await addTask({ title: newTaskTitle.trim(), status: "todo" });
    setNewTaskTitle("");
    setShowAddTask(false);
  };

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const handleSaveEdit = async () => {
    if (editingId && editTitle.trim()) {
      await updateTask(editingId, { title: editTitle.trim() });
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-eden-text-muted animate-spin" />
      </div>
    );
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
        <div className="text-center py-12">
          <p className="text-eden-text-muted">
            {activeTab === "done" ? "No completed tasks yet" : "No tasks yet. Add one!"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="group">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {task.status === "done" ? (
                      <CheckCircle2 className="w-5 h-5 text-eden-accent" />
                    ) : (
                      <Circle className="w-5 h-5 text-eden-text-muted hover:text-eden-accent transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    {editingId === task.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit();
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                          className="h-8"
                          autoFocus
                        />
                        <button onClick={handleSaveEdit} className="p-1.5 text-eden-accent hover:bg-eden-accent-soft rounded">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={handleCancelEdit} className="p-1.5 text-eden-text-muted hover:bg-eden-bg-subtle rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "text-eden-text",
                          task.status === "done" && "line-through text-eden-text-muted"
                        )}>
                          {task.title}
                        </p>
                        {task.isFocus && (
                          <Flame className="w-4 h-4 text-eden-focus flex-shrink-0" />
                        )}
                      </div>
                    )}
                    
                    {/* Actions row */}
                    <div className="flex items-center gap-3 mt-2">
                      {!task.isFocus && task.status !== "done" && (
                        <button
                          onClick={() => setFocusTask(task.id)}
                          className="text-xs text-eden-text-muted hover:text-eden-focus transition-colors"
                        >
                          Set as focus
                        </button>
                      )}
                      
                      {/* Edit & Delete */}
                      <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(task)}
                          className="p-1.5 text-eden-text-muted hover:text-eden-text hover:bg-eden-bg-subtle rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1.5 text-eden-text-muted hover:text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Target, Plus, Minus, Loader2, Pencil } from "lucide-react";
import { Card, CardContent, Progress, Input, Button } from "@/components/ui";
import { useWeeklyGoal } from "@/lib/hooks";

export function WeeklyGoal() {
  const { goal, loading, setWeeklyGoal, incrementProgress, decrementProgress } = useWeeklyGoal();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editTotal, setEditTotal] = useState("5");

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    await setWeeklyGoal(editTitle.trim(), parseInt(editTotal) || 1);
    setIsEditing(false);
    setEditTitle("");
    setEditTotal("5");
  };

  const handleStartEdit = () => {
    setEditTitle(goal?.title || "");
    setEditTotal(String(goal?.total || 5));
    setIsEditing(true);
  };

  if (loading) {
    return (
      <Card className="flex-1">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-5 h-5 text-eden-text-muted animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // No goal set - show create form
  if (!goal && !isEditing) {
    return (
      <Card className="flex-1">
        <CardContent className="py-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-eden-accent" />
            <h2 className="text-sm font-medium text-eden-text-secondary uppercase tracking-wide">
              Weekly Goal
            </h2>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full py-6 border-2 border-dashed border-eden-border rounded-lg text-eden-text-muted hover:border-eden-accent hover:text-eden-text transition-colors"
          >
            <Target className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Set your weekly goal</p>
          </button>
        </CardContent>
      </Card>
    );
  }

  // Editing form
  if (isEditing) {
    return (
      <Card className="flex-1">
        <CardContent className="py-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-eden-accent" />
            <h2 className="text-sm font-medium text-eden-text-secondary uppercase tracking-wide">
              Weekly Goal
            </h2>
          </div>

          <div className="space-y-3">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="What's your goal this week?"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
            <div className="flex gap-2 items-center">
              <span className="text-sm text-eden-text-muted">Steps:</span>
              <Input
                type="number"
                value={editTotal}
                onChange={(e) => setEditTotal(e.target.value)}
                className="w-20"
                min="1"
                max="20"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!editTitle.trim()} size="sm">
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display goal with progress
  const percentage = goal ? Math.round((goal.progress / goal.total) * 100) : 0;

  return (
    <Card className="flex-1 group">
      <CardContent className="py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-eden-accent" />
            <h2 className="text-sm font-medium text-eden-text-secondary uppercase tracking-wide">
              Weekly Goal
            </h2>
          </div>
          <button
            onClick={handleStartEdit}
            className="p-1 opacity-0 group-hover:opacity-100 text-eden-text-muted hover:text-eden-text hover:bg-eden-bg-subtle rounded transition-all"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        <p className="text-eden-text font-medium mb-4">{goal?.title}</p>

        <div className="space-y-2">
          <Progress value={goal?.progress || 0} max={goal?.total || 1} />
          <div className="flex items-center justify-between">
            <p className="text-sm text-eden-text-muted">
              {goal?.progress}/{goal?.total} steps · {percentage}%
            </p>
            <div className="flex gap-1">
              <button
                onClick={decrementProgress}
                disabled={goal?.progress === 0}
                className="p-1 rounded hover:bg-eden-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4 text-eden-text-muted" />
              </button>
              <button
                onClick={incrementProgress}
                disabled={goal?.progress === goal?.total}
                className="p-1 rounded hover:bg-eden-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 text-eden-text-muted" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

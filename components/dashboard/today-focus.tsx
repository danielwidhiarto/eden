"use client";

import { Flame, Check, Target } from "lucide-react";
import { Card, CardContent, Button, EmptyState, LoadingState } from "@/components/ui";
import { useTasks } from "@/lib/hooks";

export function TodayFocus() {
  const { focusTask, nextFocusCandidate, setFocusTask, updateTask, loading } = useTasks();

  const handleComplete = async () => {
    if (!focusTask) return;
    await updateTask(focusTask.id, {
      status: "done",
      isFocus: false,
    });
  };

  const handlePromote = async () => {
    if (!nextFocusCandidate) return;
    await setFocusTask(nextFocusCandidate.id);
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent>
          <LoadingState size="md" />
        </CardContent>
      </Card>
    );
  }

  if (focusTask) {
    return (
      <Card variant="focus" className="mb-6">
        <CardContent className="py-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-eden-focus" />
            <h2 className="text-sm font-medium text-eden-text-secondary uppercase tracking-wide">
              Today&apos;s Focus
            </h2>
          </div>

          <div className="bg-white rounded-lg border border-eden-border p-5">
            <h3 className="text-xl font-medium text-eden-text mb-2">
              {focusTask.title}
            </h3>
            {focusTask.description && (
              <p className="text-eden-text-muted text-sm mb-2">{focusTask.description}</p>
            )}

            <div className="mt-5 flex justify-end">
              <Button onClick={handleComplete} size="sm">
                <Check className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (nextFocusCandidate) {
    return (
      <Card className="mb-6">
        <CardContent className="py-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-eden-text-muted" />
            <h2 className="text-sm font-medium text-eden-text-secondary uppercase tracking-wide">
              No focus set
            </h2>
          </div>
          <p className="text-sm text-eden-text-secondary mb-4">
            Pick something to focus on to make it your main task for today.
          </p>
          <div className="bg-eden-bg-subtle rounded-lg p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-eden-text truncate">
                {nextFocusCandidate.title}
              </p>
              <p className="text-xs text-eden-text-muted mt-0.5">
                Suggested next up
              </p>
            </div>
            <Button onClick={handlePromote} size="sm">
              <Flame className="w-4 h-4 mr-1" />
              Set Focus
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent>
        <EmptyState
          icon={<Flame className="w-6 h-6" />}
          title="No tasks yet"
          description="Add tasks from the board below to get started."
        />
      </CardContent>
    </Card>
  );
}

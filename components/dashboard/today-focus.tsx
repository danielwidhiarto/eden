"use client";

import { Flame, Check, Loader2 } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { useTasks } from "@/lib/hooks";

export function TodayFocus() {
  const { focusTask, updateTask, loading } = useTasks();

  const handleComplete = async () => {
    if (!focusTask) return;
    await updateTask(focusTask.id, { 
      status: "done", 
      isFocus: false,
    });
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 text-eden-text-muted animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!focusTask) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8 text-center">
          <Flame className="w-8 h-8 text-eden-text-muted mx-auto mb-3" />
          <p className="text-eden-text-secondary">No focus task set for today</p>
          <p className="text-eden-text-muted text-sm mt-1">
            Pick a task from your board to focus on
          </p>
        </CardContent>
      </Card>
    );
  }

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

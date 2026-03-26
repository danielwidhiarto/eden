"use client";

import { useState, useEffect } from "react";
import { Edit3, Save } from "lucide-react";
import { Card, CardContent, Button, Textarea } from "@/components/ui";
import { useDayState } from "@/lib/hooks";

export function StateOfDay() {
  const { dayState, updateDayState } = useDayState();
  const [isEditing, setIsEditing] = useState(false);
  const [intention, setIntention] = useState("");
  const [constraints, setConstraints] = useState("");

  useEffect(() => {
    if (dayState) {
      setIntention(dayState.intention || "");
      setConstraints(dayState.constraints || "");
    }
  }, [dayState]);

  const handleSave = async () => {
    await updateDayState({ intention, constraints });
    setIsEditing(false);
  };

  const isEmpty = !dayState?.intention && !dayState?.constraints;

  return (
    <Card className="mb-6">
      <CardContent className="py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-eden-text-secondary uppercase tracking-wide">
            State of the Day
          </h2>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit3 className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4" />
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-eden-text-muted mb-1 block">Intention</label>
              <Textarea
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="What's your focus for today?"
                rows={2}
              />
            </div>
            <div>
              <label className="text-xs text-eden-text-muted mb-1 block">Constraints</label>
              <Textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="Any time constraints or blockers?"
                rows={2}
              />
            </div>
          </div>
        ) : isEmpty ? (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-eden-bg-subtle rounded-lg p-4 text-eden-text-muted text-sm hover:bg-eden-bg-subtle/80 transition-colors"
          >
            Click to set your intention for today...
          </button>
        ) : (
          <div className="bg-eden-bg-subtle rounded-lg p-4">
            <p className="text-eden-text">{dayState?.intention}</p>
            {dayState?.constraints && (
              <p className="text-eden-text-secondary text-sm mt-2">
                <span className="font-medium">Constraint:</span> {dayState.constraints}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

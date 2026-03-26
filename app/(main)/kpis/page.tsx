"use client";

import { useState } from "react";
import { Card, CardContent, Progress, Input, Button } from "@/components/ui";
import { useKPIs } from "@/lib/hooks";
import { 
  KPI_CONFIGS, 
  calculateScore, 
  calculateOverallScore, 
  getScoreEmoji,
  getScoreStatus 
} from "@/lib/kpi-config";
import { Loader2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function KPIsPage() {
  const { kpiValues, loading, updateKPIValue } = useKPIs();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const { overall } = calculateOverallScore(kpiValues);

  const handleStartEdit = (kpiId: string, currentValue: number) => {
    setEditingId(kpiId);
    setEditValue(String(currentValue));
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      const value = parseFloat(editValue) || 0;
      await updateKPIValue(editingId, value);
      setEditingId(null);
      setEditValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
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
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-eden-text">KPIs {new Date().getFullYear()}</h1>
        <p className="text-eden-text-muted mt-1">Track your performance indicators</p>
      </div>

      {/* Overall Score Card */}
      <Card className="mb-8">
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-sm text-eden-text-muted uppercase tracking-wide mb-2">Overall Score</p>
            <p className="text-5xl font-bold text-eden-text">{overall.toFixed(2)}</p>
            <p className="text-eden-text-secondary mt-1">out of 6.00</p>
            <div className="flex justify-center gap-1 mt-4">
              {[1, 2, 3, 4, 5, 6].map((star) => (
                <div
                  key={star}
                  className={cn(
                    "w-8 h-2 rounded-full",
                    overall >= star ? "bg-eden-accent" : "bg-eden-bg-subtle"
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {KPI_CONFIGS.map((config) => {
          const currentValue = kpiValues[config.id] ?? 0;
          const score = calculateScore(currentValue, config.scoringRules);
          const status = getScoreStatus(score);
          const emoji = getScoreEmoji(score);
          const isEditing = editingId === config.id;

          // Calculate progress percentage (for visual)
          const lastRule = config.scoringRules[config.scoringRules.length - 1];
          const maxValue = lastRule.max === 999 ? Math.max(currentValue, lastRule.min) : lastRule.max;
          const progressPercent = maxValue > 0 ? Math.min((currentValue / maxValue) * 100, 100) : 0;

          return (
            <Card key={config.id} className="relative overflow-hidden">
              <CardContent className="py-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-eden-text">{config.title}</h3>
                    <p className="text-xs text-eden-text-muted mt-0.5">{config.description}</p>
                  </div>
                  <span className="text-xl ml-2">{emoji}</span>
                </div>

                {/* Value Input / Display */}
                {isEditing ? (
                  <div className="flex gap-2 mb-3">
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      className="h-10"
                      autoFocus
                      step={config.inputType === "percentage" ? "0.01" : "1"}
                    />
                    <Button onClick={handleSaveEdit} size="sm">
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleCancelEdit} size="sm" variant="ghost">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleStartEdit(config.id, currentValue)}
                    className="w-full text-left cursor-pointer hover:bg-eden-bg-subtle rounded-lg p-3 -mx-1 mb-3 transition-colors border-2 border-dashed border-transparent hover:border-eden-border"
                  >
                    <p className="text-2xl font-semibold text-eden-text">
                      {currentValue}
                      <span className="text-sm font-normal text-eden-text-muted ml-1">
                        {config.unit}
                      </span>
                    </p>
                    <p className="text-xs text-eden-text-muted mt-1">Click to edit</p>
                  </button>
                )}

                {/* Progress Bar */}
                <Progress 
                  value={progressPercent} 
                  max={100} 
                  variant={status}
                  className="mb-3"
                />

                {/* Footer Info */}
                <div className="flex justify-between items-center text-sm">
                  <div className="flex gap-3">
                    <span className="text-eden-text-muted">
                      Score: <span className="font-medium text-eden-text">{score}</span>
                    </span>
                    <span className="text-eden-text-muted">
                      Bobot: <span className="font-medium text-eden-text">{config.weight}%</span>
                    </span>
                  </div>
                  <span className="text-eden-text-muted text-xs">
                    {config.measurementDate}
                  </span>
                </div>

                {/* Target */}
                <div className="mt-2 pt-2 border-t border-eden-border">
                  <p className="text-xs text-eden-text-muted">
                    Target: <span className="text-eden-text">{config.targetDescription}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Scoring Guide */}
      <Card className="mt-8">
        <CardContent className="py-5">
          <h3 className="font-medium text-eden-text mb-3">Scoring Guide</h3>
          <div className="grid grid-cols-6 gap-2 text-center text-sm">
            {[1, 2, 3, 4, 5, 6].map((score) => (
              <div key={score} className="p-2 rounded bg-eden-bg-subtle">
                <p className="font-semibold text-eden-text">{score}</p>
                <p className="text-xs text-eden-text-muted">
                  {score === 1 && "Poor"}
                  {score === 2 && "Below"}
                  {score === 3 && "Fair"}
                  {score === 4 && "Target"}
                  {score === 5 && "Good"}
                  {score === 6 && "Excellent"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

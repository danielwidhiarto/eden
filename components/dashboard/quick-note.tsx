"use client";

import { useState } from "react";
import { FileText, CornerDownLeft } from "lucide-react";
import { Card, CardContent, Textarea, Button } from "@/components/ui";
import { useNotes } from "@/lib/hooks";

export function QuickNote() {
  const { addNote } = useNotes();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;
    setSaving(true);
    await addNote(note);
    setNote("");
    setSaving(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  return (
    <Card className="flex-1">
      <CardContent className="py-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-eden-text-secondary" />
          <h2 className="text-sm font-medium text-eden-text-secondary uppercase tracking-wide">
            Quick Note
          </h2>
        </div>

        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Capture an idea..."
          rows={3}
          className="mb-3"
        />

        <div className="flex justify-end">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleSave} 
            disabled={!note.trim() || saving}
          >
            {saving ? "Saving..." : "Save"}
            <CornerDownLeft className="w-3 h-3 ml-1.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

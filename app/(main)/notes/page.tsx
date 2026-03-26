"use client";

import { useState } from "react";
import { Plus, CornerDownLeft, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, Textarea, Button } from "@/components/ui";
import { useNotes } from "@/lib/hooks";
import { format, isToday, isYesterday } from "date-fns";
import { Timestamp } from "firebase/firestore";

export default function NotesPage() {
  const { notes, loading, addNote, deleteNote } = useNotes();
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    await addNote(newNote);
    setNewNote("");
    setSaving(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  const handleDelete = async (noteId: string) => {
    if (confirm("Delete this note?")) {
      await deleteNote(noteId);
    }
  };

  // Group notes by date
  const groupedNotes = notes.reduce((acc, note) => {
    const createdAt = note.createdAt instanceof Timestamp 
      ? note.createdAt.toDate() 
      : new Date();
    
    let section = format(createdAt, "MMMM d, yyyy");
    if (isToday(createdAt)) section = "Today";
    else if (isYesterday(createdAt)) section = "Yesterday";
    
    if (!acc[section]) acc[section] = [];
    acc[section].push({ id: note.id, content: note.content, createdAt });
    return acc;
  }, {} as Record<string, Array<{ id: string; content: string; createdAt: Date }>>);

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
        <h1 className="text-3xl font-semibold text-eden-text">Notes</h1>
      </div>

      {/* Quick Capture */}
      <Card className="mb-8">
        <CardContent className="py-5">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type something..."
            rows={3}
            className="mb-3"
          />
          <div className="flex justify-end">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleSave} 
              disabled={!newNote.trim() || saving}
            >
              {saving ? "Saving..." : "Save"}
              <CornerDownLeft className="w-3 h-3 ml-1.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes by Section */}
      {Object.keys(groupedNotes).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-eden-text-muted">No notes yet. Start capturing your ideas!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedNotes).map(([section, sectionNotes]) => (
            <div key={section}>
              <h2 className="text-sm font-medium text-eden-text-secondary uppercase tracking-wide mb-4">
                {section}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectionNotes.map((note) => (
                  <Card key={note.id} className="group relative">
                    <CardContent className="py-4">
                      <p className="text-eden-text whitespace-pre-wrap mb-3">{note.content}</p>
                      <p className="text-xs text-eden-text-muted">
                        {format(note.createdAt, "h:mm a")}
                      </p>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-eden-text-muted hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

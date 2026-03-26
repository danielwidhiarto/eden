"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/use-auth";
import type { Note } from "@/lib/types";

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, "notes"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Note[];
        
        // Sort client-side by createdAt (newest first)
        notesData.sort((a, b) => {
          const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });
        
        setNotes(notesData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching notes:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addNote = useCallback(
    async (content: string) => {
      if (!user || !content.trim()) return;

      await addDoc(collection(db, "notes"), {
        content: content.trim(),
        userId: user.uid,
        isPinned: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [user]
  );

  const updateNote = useCallback(
    async (noteId: string, data: Partial<Note>) => {
      await updateDoc(doc(db, "notes", noteId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },
    []
  );

  const deleteNote = useCallback(async (noteId: string) => {
    await deleteDoc(doc(db, "notes", noteId));
  }, []);

  const togglePin = useCallback(
    async (noteId: string, currentPinned: boolean) => {
      await updateDoc(doc(db, "notes", noteId), {
        isPinned: !currentPinned,
        updatedAt: serverTimestamp(),
      });
    },
    []
  );

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
  };
}

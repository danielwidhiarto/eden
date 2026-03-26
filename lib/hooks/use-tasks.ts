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
import type { Task, TaskStatus } from "@/lib/types";

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        
        // Sort client-side by createdAt (newest first)
        tasksData.sort((a, b) => {
          const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });
        
        setTasks(tasksData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching tasks:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTask = useCallback(
    async (data: Partial<Task>) => {
      if (!user) return;

      await addDoc(collection(db, "tasks"), {
        ...data,
        userId: user.uid,
        status: data.status || "todo",
        priority: data.priority || "medium",
        isFocus: data.isFocus || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    [user]
  );

  const updateTask = useCallback(
    async (taskId: string, data: Partial<Task>) => {
      await updateDoc(doc(db, "tasks", taskId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },
    []
  );

  const deleteTask = useCallback(async (taskId: string) => {
    await deleteDoc(doc(db, "tasks", taskId));
  }, []);

  const toggleTaskStatus = useCallback(
    async (taskId: string, currentStatus: TaskStatus) => {
      const newStatus: TaskStatus = currentStatus === "done" ? "todo" : "done";
      await updateDoc(doc(db, "tasks", taskId), {
        status: newStatus,
        completedAt: newStatus === "done" ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      });
    },
    []
  );

  const setFocusTask = useCallback(
    async (taskId: string) => {
      if (!user) return;

      // Remove focus from all other tasks
      const currentFocus = tasks.find((t) => t.isFocus);
      if (currentFocus) {
        await updateDoc(doc(db, "tasks", currentFocus.id), {
          isFocus: false,
          updatedAt: serverTimestamp(),
        });
      }

      // Set new focus
      await updateDoc(doc(db, "tasks", taskId), {
        isFocus: true,
        status: "doing",
        updatedAt: serverTimestamp(),
      });
    },
    [user, tasks]
  );

  // Derived data
  const focusTask = tasks.find((t) => t.isFocus && t.status !== "done");
  const todayTasks = tasks.filter((t) => {
    if (!t.scheduledDate) return false;
    const scheduled = t.scheduledDate instanceof Timestamp 
      ? t.scheduledDate.toDate() 
      : new Date(t.scheduledDate);
    const today = new Date();
    return scheduled.toDateString() === today.toDateString();
  });
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doingTasks = tasks.filter((t) => t.status === "doing");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    setFocusTask,
    focusTask,
    todayTasks,
    todoTasks,
    doingTasks,
    doneTasks,
  };
}

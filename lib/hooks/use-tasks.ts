"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/use-auth";
import type { Task, TaskStatus } from "@/lib/types";

const ARCHIVE_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 30 * 6; // 6 months

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const autoArchiveRanRef = useRef(false);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTasks([]);
      setArchivedTasks([]);
      setLoading(false);
      return;
    }

    autoArchiveRanRef.current = false;

    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allTasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];

        // Split into active vs archived
        const active: Task[] = [];
        const archived: Task[] = [];
        for (const task of allTasks) {
          if (task.archivedAt) {
            archived.push(task);
          } else {
            active.push(task);
          }
        }

        // Sort client-side by createdAt (newest first)
        const sortByCreated = (a: Task, b: Task) => {
          const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        };
        active.sort(sortByCreated);
        archived.sort((a, b) => {
          const aTime = a.archivedAt instanceof Timestamp ? a.archivedAt.toMillis() : 0;
          const bTime = b.archivedAt instanceof Timestamp ? b.archivedAt.toMillis() : 0;
          return bTime - aTime;
        });

        setTasks(active);
        setArchivedTasks(archived);
        setLoading(false);

        // Auto-archive: done tasks older than threshold with no archivedAt
        if (!autoArchiveRanRef.current) {
          const now = Date.now();
          const toArchive = active.filter(
            (t) =>
              t.status === "done" &&
              !t.archivedAt &&
              t.completedAt instanceof Timestamp &&
              now - t.completedAt.toMillis() > ARCHIVE_THRESHOLD_MS
          );
          if (toArchive.length > 0) {
            const batch = writeBatch(db);
            toArchive.forEach((t) => {
              batch.update(doc(db, "tasks", t.id), {
                status: "archived" as TaskStatus,
                archivedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            });
            batch.commit().catch((err) => {
              console.error("Auto-archive failed:", err);
            });
          }
          autoArchiveRanRef.current = true;
        }
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
        status: data.status || "backlog",
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

      // Find current focus from local state (snapshot listener keeps this fresh).
      // The transaction below ensures both updates happen atomically.
      const currentFocus = tasks.find((t) => t.isFocus && t.id !== taskId);

      await runTransaction(db, async (tx) => {
        const newFocusRef = doc(db, "tasks", taskId);
        const newFocusSnap = await tx.get(newFocusRef);
        if (!newFocusSnap.exists()) return;

        if (currentFocus) {
          const oldFocusRef = doc(db, "tasks", currentFocus.id);
          tx.update(oldFocusRef, {
            isFocus: false,
            updatedAt: serverTimestamp(),
          });
        }

        tx.update(newFocusRef, {
          isFocus: true,
          status: "doing" as TaskStatus,
          updatedAt: serverTimestamp(),
        });
      });
    },
    [user, tasks]
  );

  const archiveTask = useCallback(async (taskId: string) => {
    await updateDoc(doc(db, "tasks", taskId), {
      status: "archived" as TaskStatus,
      archivedAt: serverTimestamp(),
      isFocus: false,
      updatedAt: serverTimestamp(),
    });
  }, []);

  const unarchiveTask = useCallback(async (taskId: string) => {
    await updateDoc(doc(db, "tasks", taskId), {
      status: "done" as TaskStatus,
      archivedAt: null,
      updatedAt: serverTimestamp(),
    });
  }, []);

  // Derived data
  const focusTask = tasks.find((t) => t.isFocus && t.status !== "done" && t.status !== "archived");
  const backlogTasks = tasks.filter((t) => t.status === "backlog");
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doingTasks = tasks.filter((t) => t.status === "doing");
  const doneTasks = tasks.filter((t) => t.status === "done");

  // Next focus candidate: oldest doing, else highest-priority todo/backlog
  const nextFocusCandidate = (() => {
    const candidates = tasks.filter(
      (t) => t.id !== focusTask?.id && (t.status === "doing" || t.status === "todo" || t.status === "backlog")
    );
    if (candidates.length === 0) return undefined;
    const priorityRank = { high: 0, medium: 1, low: 2 };
    return candidates.sort((a, b) => {
      // Prefer doing over todo over backlog
      const statusRank = { doing: 0, todo: 1, backlog: 2 };
      const s = statusRank[a.status as keyof typeof statusRank] - statusRank[b.status as keyof typeof statusRank];
      if (s !== 0) return s;
      // Then by priority
      const p = priorityRank[a.priority] - priorityRank[b.priority];
      if (p !== 0) return p;
      // Then by due date (earlier first, undated last)
      const aDue = a.dueDate instanceof Timestamp ? a.dueDate.toMillis() : Infinity;
      const bDue = b.dueDate instanceof Timestamp ? b.dueDate.toMillis() : Infinity;
      if (aDue !== bDue) return aDue - bDue;
      // Then by created date (older first)
      const aCreated = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const bCreated = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return aCreated - bCreated;
    })[0];
  })();

  return {
    tasks,
    archivedTasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    setFocusTask,
    archiveTask,
    unarchiveTask,
    focusTask,
    nextFocusCandidate,
    backlogTasks,
    todoTasks,
    doingTasks,
    doneTasks,
  };
}

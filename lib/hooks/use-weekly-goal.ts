"use client";

import { useState, useEffect, useCallback } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/use-auth";
import { startOfWeek, format } from "date-fns";

export interface WeeklyGoal {
  title: string;
  progress: number;
  total: number;
}

export function useWeeklyGoal() {
  const { user } = useAuth();
  const [goal, setGoal] = useState<WeeklyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get week identifier (e.g., "2026-W13")
  const getWeekId = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    return format(weekStart, "yyyy-'W'ww");
  };

  const weekId = getWeekId();

  useEffect(() => {
    if (!user) {
      setGoal(null);
      setLoading(false);
      return;
    }

    const fetchGoal = async () => {
      try {
        const docRef = doc(db, "weeklyGoals", `${user.uid}_${weekId}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setGoal({
            title: data.title || "",
            progress: data.progress || 0,
            total: data.total || 1,
          });
        } else {
          setGoal(null);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching weekly goal:", err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchGoal();
  }, [user, weekId]);

  const setWeeklyGoal = useCallback(
    async (title: string, total: number = 1) => {
      if (!user) return;

      const newGoal: WeeklyGoal = { title, progress: 0, total };
      setGoal(newGoal);

      const docRef = doc(db, "weeklyGoals", `${user.uid}_${weekId}`);
      await setDoc(docRef, {
        ...newGoal,
        userId: user.uid,
        weekId,
        updatedAt: serverTimestamp(),
      });
    },
    [user, weekId]
  );

  const updateProgress = useCallback(
    async (progress: number) => {
      if (!user || !goal) return;

      const updatedGoal = { ...goal, progress };
      setGoal(updatedGoal);

      const docRef = doc(db, "weeklyGoals", `${user.uid}_${weekId}`);
      await setDoc(
        docRef,
        {
          progress,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [user, weekId, goal]
  );

  const incrementProgress = useCallback(async () => {
    if (!goal) return;
    const newProgress = Math.min(goal.progress + 1, goal.total);
    await updateProgress(newProgress);
  }, [goal, updateProgress]);

  const decrementProgress = useCallback(async () => {
    if (!goal) return;
    const newProgress = Math.max(goal.progress - 1, 0);
    await updateProgress(newProgress);
  }, [goal, updateProgress]);

  return {
    goal,
    loading,
    error,
    setWeeklyGoal,
    updateProgress,
    incrementProgress,
    decrementProgress,
  };
}

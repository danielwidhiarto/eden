"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/use-auth";
import type { DayState } from "@/lib/types";
import { format } from "date-fns";

export function useDayState() {
  const { user } = useAuth();
  const [dayState, setDayState] = useState<DayState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!user) {
      setDayState(null);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "dayStates"),
      where("userId", "==", user.uid),
      where("date", "==", today)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setDayState(null);
        } else {
          const data = snapshot.docs[0];
          setDayState({
            id: data.id,
            ...data.data(),
          } as DayState);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching day state:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, today]);

  const updateDayState = useCallback(
    async (data: { intention?: string; constraints?: string }) => {
      if (!user) return;

      const docId = `${user.uid}_${today}`;
      await setDoc(
        doc(db, "dayStates", docId),
        {
          ...data,
          userId: user.uid,
          date: today,
          updatedAt: serverTimestamp(),
          createdAt: dayState ? dayState.createdAt : serverTimestamp(),
        },
        { merge: true }
      );
    },
    [user, today, dayState]
  );

  return {
    dayState,
    loading,
    error,
    updateDayState,
  };
}

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

interface KPIValues {
  [kpiId: string]: number;
}

interface KPIData {
  values: KPIValues;
  year: number;
  updatedAt?: Date;
}

export function useKPIs() {
  const { user } = useAuth();
  const [kpiValues, setKpiValues] = useState<KPIValues>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!user) {
      setKpiValues({});
      setLoading(false);
      return;
    }

    const fetchKPIs = async () => {
      try {
        const docRef = doc(db, "kpis", `${user.uid}_${currentYear}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as KPIData;
          setKpiValues(data.values || {});
        } else {
          setKpiValues({});
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching KPIs:", err);
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchKPIs();
  }, [user, currentYear]);

  const updateKPIValue = useCallback(
    async (kpiId: string, value: number) => {
      if (!user) return;

      const newValues = { ...kpiValues, [kpiId]: value };
      setKpiValues(newValues);

      const docRef = doc(db, "kpis", `${user.uid}_${currentYear}`);
      await setDoc(
        docRef,
        {
          values: newValues,
          userId: user.uid,
          year: currentYear,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [user, currentYear, kpiValues]
  );

  const updateAllKPIValues = useCallback(
    async (values: KPIValues) => {
      if (!user) return;

      setKpiValues(values);

      const docRef = doc(db, "kpis", `${user.uid}_${currentYear}`);
      await setDoc(
        docRef,
        {
          values,
          userId: user.uid,
          year: currentYear,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [user, currentYear]
  );

  return {
    kpiValues,
    loading,
    error,
    updateKPIValue,
    updateAllKPIValues,
  };
}

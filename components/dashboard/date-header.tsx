"use client";

import { format } from "date-fns";
import { useAuth } from "@/lib/hooks";

export function DateHeader() {
  const { user } = useAuth();
  const today = new Date();
  const dayName = format(today, "EEEE");
  const dateStr = format(today, "d MMMM yyyy");
  const hour = today.getHours();
  
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  } else if (hour >= 17) {
    greeting = "Good evening";
  }

  const displayName = user?.displayName?.split(" ")[0] || "there";

  return (
    <div className="mb-8">
      <p className="text-eden-text-muted text-sm font-medium">{dayName}</p>
      <h1 className="text-3xl font-semibold text-eden-text mt-1">{dateStr}</h1>
      <p className="text-eden-text-secondary mt-2">{greeting}, {displayName}</p>
    </div>
  );
}

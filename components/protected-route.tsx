"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-eden-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-eden-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

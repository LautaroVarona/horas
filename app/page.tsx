"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useHasData } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const hasData = useHasData();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(hasData ? "/dashboard" : "/upload");
  }, [hasData, hydrated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Cargando...</p>
    </div>
  );
}

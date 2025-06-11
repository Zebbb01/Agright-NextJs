// src/components/page-loading-spinner.tsx
"use client";

import { useReliableLoading } from "@/hooks/use-reliable-loading";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";

export function PageLoadingSpinner() {
  const loading = useReliableLoading();
  const [shouldShow, setShouldShow] = useState(false);

  // Add a slight delay before showing to prevent flashing
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShouldShow(true), 150);
      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }
  }, [loading]);

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
// src/components/page-loading-spinner.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export function PageLoadingSpinner() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Effect to show the spinner when navigation starts
  useEffect(() => {
    // We want to show a spinner immediately when the URL changes.
    setLoading(true);

    // No direct "routeChangeComplete" in App Router for client components.
    // The spinner will naturally disappear when the new page component renders and replaces the old content in the layout.
    // However, to prevent flickering for very fast loads, we'll hide it after a small delay.
  }, [pathname, searchParams]); // Trigger when path or search params change

  // Effect to hide the spinner after a short delay (optional, for fast loads)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) { // Only set a timeout if loading is true
      timer = setTimeout(() => {
        setLoading(false);
      }, 300); // Adjust delay as needed (e.g., 300ms for a noticeable effect)
    }

    return () => clearTimeout(timer); // Cleanup the timer
  }, [loading, pathname, searchParams]); // Rerun this when loading state changes or path changes

  if (!loading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Spinner />
    </div>
  );
}
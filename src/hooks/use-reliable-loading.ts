// src/hooks/use-reliable-loading.ts
"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export function useReliableLoading() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const loadingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startLoading = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (!loadingRef.current) {
        timeoutRef.current = setTimeout(() => {
          loadingRef.current = true;
          setLoading(true);
        }, 100);
      }
    };

    const stopLoading = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Add a small delay to ensure the page is fully rendered
      setTimeout(() => {
        loadingRef.current = false;
        setLoading(false);
      }, 100);
    };

    // Handle link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Check if it's an internal link and not the current page
      if (href.startsWith('/') && href !== pathname) {
        // Check if it's not opening in new tab
        if (!link.target && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
          startLoading();
        }
      }
    };

    // Handle programmatic navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      startLoading();
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function(...args) {
      startLoading();
      return originalReplaceState.apply(this, args);
    };

    // Handle back/forward navigation
    const handlePopState = () => {
      startLoading();
    };

    // Add event listeners
    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('popstate', handlePopState);

    // Stop loading when pathname changes (navigation complete)
    stopLoading();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handlePopState);
      
      // Restore original functions
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [pathname]);

  // Force stop loading after a maximum time to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const maxLoadingTime = setTimeout(() => {
        loadingRef.current = false;
        setLoading(false);
      }, 5000); // 5 second maximum

      return () => clearTimeout(maxLoadingTime);
    }
  }, [loading]);

  return loading;
}
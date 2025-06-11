// src/hooks/use-router-loading.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export function useRouterLoading() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let loadingTimer: NodeJS.Timeout;
    let isNavigating = false;

    const startLoading = () => {
      if (!isNavigating) {
        isNavigating = true;
        loadingTimer = setTimeout(() => {
          setLoading(true);
        }, 100);
      }
    };

    const stopLoading = () => {
      isNavigating = false;
      clearTimeout(loadingTimer);
      setLoading(false);
    };

    // Create a custom router with loading states
    const customPush = (href: string, options?: any) => {
      if (href !== pathname) {
        startLoading();
      }
      return router.push(href, options);
    };

    const customReplace = (href: string, options?: any) => {
      if (href !== pathname) {
        startLoading();
      }
      return router.replace(href, options);
    };

    // Override router methods temporarily
    const originalPush = router.push;
    const originalReplace = router.replace;
    
    (router as any).push = customPush;
    (router as any).replace = customReplace;

    // Listen for link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || 
          href.startsWith('http') || 
          href.startsWith('mailto:') || 
          href.startsWith('tel:') ||
          link.target === '_blank' ||
          e.metaKey || 
          e.ctrlKey || 
          e.shiftKey) {
        return;
      }

      if (href !== pathname && href.startsWith('/')) {
        startLoading();
      }
    };

    // Listen for browser navigation
    const handlePopState = () => {
      startLoading();
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);

    // Stop loading when pathname changes
    stopLoading();

    return () => {
      clearTimeout(loadingTimer);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
      
      // Restore original router methods
      (router as any).push = originalPush;
      (router as any).replace = originalReplace;
    };
  }, [pathname, router]);

  return loading;
}
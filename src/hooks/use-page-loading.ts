// src/hooks/use-page-loading.ts
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function usePageLoading() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let showLoadingTimeout: NodeJS.Timeout;
    let hideLoadingTimeout: NodeJS.Timeout;

    const showLoading = () => {
      clearTimeout(hideLoadingTimeout);
      showLoadingTimeout = setTimeout(() => {
        setLoading(true);
      }, 100); // Reduced delay for more responsive feel
    };

    const hideLoading = () => {
      clearTimeout(showLoadingTimeout);
      // Add a small delay to ensure page is fully rendered
      hideLoadingTimeout = setTimeout(() => {
        setLoading(false);
      }, 50);
    };

    // Handle Next.js Link clicks specifically
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (!link) return;

      try {
        const href = link.getAttribute('href');
        if (!href) return;

        // Check if it's an internal navigation
        const isInternal = href.startsWith('/') || 
                          href.startsWith('#') || 
                          href.includes(window.location.origin);

        // Skip if it's external, has target="_blank", or opens in new tab
        if (!isInternal || 
            link.target === '_blank' || 
            e.ctrlKey || 
            e.metaKey || 
            e.shiftKey) {
          return;
        }

        // Check if it's the same page
        const currentPath = window.location.pathname;
        const newPath = href.startsWith('/') ? href : new URL(href, window.location.origin).pathname;
        
        if (currentPath !== newPath) {
          showLoading();
        }
      } catch (error) {
        // Ignore URL parsing errors
        console.warn('Error parsing link URL:', error);
      }
    };

    // Handle programmatic navigation
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    window.history.pushState = function(state, title, url) {
      if (url && url.toString() !== window.location.pathname) {
        showLoading();
      }
      return originalPush.call(this, state, title, url);
    };

    window.history.replaceState = function(state, title, url) {
      if (url && url.toString() !== window.location.pathname) {
        showLoading();
      }
      return originalReplace.call(this, state, title, url);
    };

    // Handle browser back/forward
    const handlePopState = () => {
      showLoading();
    };

    // Add event listeners
    document.addEventListener('click', handleLinkClick, true); // Use capture phase
    window.addEventListener('popstate', handlePopState);

    // Hide loading when pathname changes (navigation completed)
    hideLoading();

    // Cleanup function
    return () => {
      clearTimeout(showLoadingTimeout);
      clearTimeout(hideLoadingTimeout);
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handlePopState);
      
      // Restore original methods
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
    };
  }, [pathname]); // This effect runs every time pathname changes

  return loading;
}
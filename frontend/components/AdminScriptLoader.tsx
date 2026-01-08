'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Component to handle admin script loading and re-initialization on Next.js navigation
 * Fixes issues with scripts not running after client-side navigation
 * Ensures proper loading order: jQuery -> Bootstrap -> metisMenu -> simplebar -> app.js
 */
export function AdminScriptLoader() {
  const pathname = usePathname();
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    // Load scripts in order
    const loadScripts = async () => {
      try {
        // Check if already loaded
        if ((window as any).__adminScriptsLoaded) {
          setScriptsLoaded(true);
          return;
        }

        // 1. Load jQuery first
        await loadScript('/assets_admin/libs/jquery/jquery.min.js', 'jquery-script');
        
        // Wait for jQuery to be available
        await waitFor(() => typeof (window as any).$ !== 'undefined' && typeof (window as any).jQuery !== 'undefined');

        // 2. Load Bootstrap
        await loadScript('/assets_admin/libs/bootstrap/js/bootstrap.bundle.min.js', 'bootstrap-script');
        
        // 3. Load metisMenu (requires jQuery)
        await loadScript('/assets_admin/libs/metismenu/metisMenu.min.js', 'metismenu-script');
        
        // 4. Load simplebar
        await loadScript('/assets_admin/libs/simplebar/simplebar.min.js', 'simplebar-script');
        
        // 5. Load app.js
        await loadScript('/assets_admin/js/app-nextjs.js', 'app-nextjs-script');

        // Mark scripts as loaded
        (window as any).__adminScriptsLoaded = true;
        setScriptsLoaded(true);
      } catch (error) {
        console.error('Error loading admin scripts:', error);
      }
    };

    loadScripts();
  }, []); // Only load once on mount

  useEffect(() => {
    if (!scriptsLoaded) return;

    // Re-initialize scripts after navigation
    const timer = setTimeout(() => {
      // Trigger menu highlighting
      if (typeof window !== 'undefined') {
        const event = new Event('popstate');
        window.dispatchEvent(event);
      }

      // Re-initialize metisMenu if available
      if (typeof (window as any).$ !== 'undefined' && typeof (window as any).$.fn !== 'undefined') {
        try {
          const $ = (window as any).$;
          if (typeof $.fn.metisMenu !== 'undefined') {
            $('#side-menu').metisMenu();
          }
        } catch (e) {
          console.warn('MetisMenu re-initialization skipped:', e);
        }
      }

      // Re-initialize Bootstrap components if available
      if (typeof window !== 'undefined' && typeof (window as any).bootstrap !== 'undefined') {
        try {
          // Initialize tooltips
          const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
          tooltipTriggerList.forEach((tooltipTriggerEl) => {
            try {
              new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
            } catch (e) {
              // Ignore if already initialized
            }
          });

          // Initialize popovers
          const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
          popoverTriggerList.forEach((popoverTriggerEl) => {
            try {
              new (window as any).bootstrap.Popover(popoverTriggerEl);
            } catch (e) {
              // Ignore if already initialized
            }
          });
        } catch (e) {
          console.warn('Bootstrap re-initialization skipped:', e);
        }
      }

      // Re-initialize Feather icons if available
      if (typeof window !== 'undefined' && typeof (window as any).feather !== 'undefined') {
        try {
          (window as any).feather.replace();
        } catch (e) {
          console.warn('Feather icons re-initialization skipped:', e);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, scriptsLoaded]);

  return null;
}

/**
 * Helper function to load a script dynamically
 */
function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existing = document.getElementById(id);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = false; // Load in order
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

/**
 * Helper function to wait for a condition
 */
function waitFor(condition: () => boolean, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error('Timeout waiting for condition'));
      }
    }, 50);
  });
}

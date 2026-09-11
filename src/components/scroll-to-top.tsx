'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Resets the window scroll position to the top whenever the route changes.
 * Renders nothing — purely a side-effect component.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Use instant scroll (no smooth) so the page snaps to top immediately on navigation
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

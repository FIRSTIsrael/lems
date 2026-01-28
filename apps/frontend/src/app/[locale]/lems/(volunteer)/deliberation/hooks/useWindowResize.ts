'use client';

import { useState, useEffect } from 'react';

/**
 * Hook that triggers a re-render when the window is resized or zoomed.
 * This is useful for components that depend on viewport dimensions (like flexbox layouts with vh units).
 *
 * When the browser zoom level changes, the viewport dimensions change, which fires a resize event.
 * This hook listens to that event and forces a re-render by updating internal state.
 */
export function useWindowResize() {
  const [, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce the resize event to avoid excessive re-renders
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 50);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
}

import { useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  // Use ResizeObserver to detect parent container size changes
  const resizeObserver = new ResizeObserver(() => {
    callback();
  });

  // Also listen to window resize as fallback
  const handleWindowResize = () => callback();
  window.addEventListener('resize', handleWindowResize);

  // Observe all potential parent containers by observing document root
  // This ensures we catch parent container resizing, not just window resizing
  if (document.documentElement) {
    resizeObserver.observe(document.documentElement);
  }

  return () => {
    resizeObserver.disconnect();
    window.removeEventListener('resize', handleWindowResize);
  };
};

function useDimensions(ref: React.RefObject<HTMLElement | null>) {
  const getSnapshot = () => {
    const element = ref.current;
    if (!element) return '0,0';

    let width = element.offsetWidth ?? 0;
    let height = element.offsetHeight ?? 0;

    // Retry logic: if dimensions are 0, try getting computed dimensions
    // This handles cases where the element is hidden or not yet laid out
    if ((width === 0 || height === 0) && element.offsetParent) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0) width = rect.width;
      if (rect.height > 0) height = rect.height;
    }

    // If still 0, use client dimensions as last resort
    if (width === 0 && element.clientWidth > 0) width = element.clientWidth;
    if (height === 0 && element.clientHeight > 0) height = element.clientHeight;

    return `${width},${height}`;
  };

  const dims = useSyncExternalStore(subscribe, getSnapshot);
  const [width, height] = dims.split(',').map(Number);
  return { width, height };
}

export { useDimensions };

import { useSyncExternalStore } from 'react';

function useDimensions(ref: React.RefObject<HTMLElement | null>) {
  const subscribe = (callback: () => void) => {
    const element = ref.current;
    if (!element) return () => {};

    // Use ResizeObserver to detect the specific element's size changes
    const resizeObserver = new ResizeObserver(() => {
      callback();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  };

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

import { useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
};

function useDimensions(ref: React.RefObject<HTMLElement | null>) {
  const getSnapshot = () => {
    const width = ref.current?.offsetWidth ?? 0;
    const height = ref.current?.offsetHeight ?? 0;
    return `${width},${height}`;
  };

  const dims = useSyncExternalStore(subscribe, getSnapshot);
  const [width, height] = dims.split(',').map(Number);
  return { width, height };
}

export { useDimensions };

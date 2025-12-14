import { useMemo, useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  window.addEventListener('resize', callback);
  return () => {
    window.removeEventListener('resize', callback);
  };
};

function useDimensions(ref: React.RefObject<HTMLElement>) {
  const dimensions = useSyncExternalStore(subscribe, () =>
    JSON.stringify({
      width: ref.current?.offsetWidth ?? 0, // 0 is default width
      height: ref.current?.offsetHeight ?? 0 // 0 is default height
    })
  );
  return useMemo(() => JSON.parse(dimensions), [dimensions]);
}

export { useDimensions };

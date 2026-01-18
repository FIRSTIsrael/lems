import { useEffect, useRef } from 'react';

/**
 * Hook to create seamless infinite scroll animation
 * Prevents jumping by resetting the scroll position when animation completes
 * @param duration - Animation duration in seconds
 */
export const useInfiniteScroll = (duration: number = 45) => {
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    const tableBody = bodyRef.current;
    if (!tableBody) return;

    const handleAnimationIteration = () => {
      // Reset scroll position seamlessly
      tableBody.style.animation = 'none';

      // Use requestAnimationFrame to ensure the reset is rendered
      requestAnimationFrame(() => {
        tableBody.style.animation = `scroll-up ${duration}s linear infinite`;
      });
    };

    tableBody.addEventListener('animationiteration', handleAnimationIteration);

    return () => {
      tableBody.removeEventListener('animationiteration', handleAnimationIteration);
    };
  }, [duration]);

  return bodyRef;
};

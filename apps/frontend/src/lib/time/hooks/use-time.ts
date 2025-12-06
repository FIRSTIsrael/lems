import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useTimeSync } from './use-time-sync';

interface UseTimeOptions {
  interval?: number;
}

/**
 * Hook to get synchronized time
 * Updates at the specified interval with server-synced time
 * @param options.interval - Update interval in milliseconds (optional)
 * @returns Current synchronized time as Dayjs object
 */
export const useTime = ({ interval: intervalMilliseconds }: UseTimeOptions = {}) => {
  const { offset } = useTimeSync();
  const [currentTime, setCurrentTime] = useState<Dayjs>(() => dayjs().add(offset, 'milliseconds'));

  useEffect(() => {
    // Update time immediately when offset changes
    setCurrentTime(dayjs().add(offset, 'milliseconds'));

    // Set up interval updates if specified
    if (intervalMilliseconds && intervalMilliseconds > 0) {
      const interval = setInterval(
        () => setCurrentTime(dayjs().add(offset, 'milliseconds')),
        intervalMilliseconds
      );

      return () => clearInterval(interval);
    }
  }, [offset, intervalMilliseconds]);

  return currentTime;
};

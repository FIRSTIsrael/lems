import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useTimeSync } from '../../lib/timesync';

interface UseTimeOptions {
  interval?: number;
}

export const useTime = ({ interval: intervalMilliseconds }: UseTimeOptions) => {
  const { offset } = useTimeSync();
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs().add(offset, 'milliseconds'));

  useEffect(() => {
    if (intervalMilliseconds) {
      const interval = setInterval(
        () => setCurrentTime(dayjs().add(offset, 'milliseconds')),
        intervalMilliseconds
      );

      return () => clearInterval(interval);
    }
  }, [offset, intervalMilliseconds]);

  return currentTime;
};

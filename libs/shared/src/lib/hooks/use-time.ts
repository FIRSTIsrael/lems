import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

interface UseTimeOptions {
  interval?: number;
}

export const useTime = ({ interval: intervalMilliseconds }: UseTimeOptions) => {
  // TODO: Add back timesync?
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());

  useEffect(() => {
    if (intervalMilliseconds) {
      const interval = setInterval(() => setCurrentTime(dayjs()), intervalMilliseconds);

      return () => clearInterval(interval);
    }
  }, [intervalMilliseconds]);

  return currentTime;
};

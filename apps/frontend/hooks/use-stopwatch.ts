import { useEffect, useState } from 'react';

const useStopwatch = (startDate: Date) => {
  const stopwatchDate = new Date(startDate).getTime();

  const [stopwatch, setStopwatch] = useState(new Date().getTime() - stopwatchDate);

  useEffect(() => {
    const interval = setInterval(() => {
      setStopwatch(new Date().getTime() - stopwatchDate);
    }, 1000);

    return () => clearInterval(interval);
  }, [stopwatchDate]);

  return timestampBreakdown(stopwatch);
};

const timestampBreakdown = (countDown: number) => {
  const millisecondsInMinute = 1000 * 60;
  const millisecondsInHour = millisecondsInMinute * 60;
  const millisecondsInDay = millisecondsInHour * 24;

  const days = Math.floor(countDown / millisecondsInDay);
  const hours = Math.floor((countDown % millisecondsInDay) / millisecondsInHour);
  const minutes = Math.floor((countDown % millisecondsInHour) / millisecondsInMinute);
  const seconds = Math.floor((countDown % millisecondsInMinute) / 1000);

  return [days, hours, minutes, seconds];
};

export default useStopwatch;

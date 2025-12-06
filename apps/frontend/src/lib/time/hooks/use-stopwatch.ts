import { useTime } from './use-time';

export const useStopwatch = (startDate: Date) => {
  const currentTime = useTime({ interval: 1000 });
  return timestampBreakdown(currentTime.diff(startDate));
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

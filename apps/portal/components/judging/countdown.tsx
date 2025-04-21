import { Typography, TypographyProps } from '@mui/material';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface CountdownProps extends TypographyProps {
  targetDate: Date;
  expiredText?: string;
  allowNegativeValues?: boolean;
}

const useCountdown = (targetDate: Date) => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  const countDown = dayjs(targetDate).diff(currentTime);
  const millisecondsInMinute = 1000 * 60;
  const millisecondsInHour = millisecondsInMinute * 60;
  const millisecondsInDay = millisecondsInHour * 24;

  const days = Math.floor(countDown / millisecondsInDay);
  const hours = Math.floor((countDown % millisecondsInDay) / millisecondsInHour);
  const minutes = Math.floor((countDown % millisecondsInHour) / millisecondsInMinute);
  const seconds = Math.floor((countDown % millisecondsInMinute) / 1000);

  return [days, hours, minutes, seconds];
};

const useStopwatch = (startDate: Date) => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsed = currentTime.diff(startDate);
  const millisecondsInMinute = 1000 * 60;
  const millisecondsInHour = millisecondsInMinute * 60;
  const millisecondsInDay = millisecondsInHour * 24;

  const days = Math.floor(elapsed / millisecondsInDay);
  const hours = Math.floor((elapsed % millisecondsInDay) / millisecondsInHour);
  const minutes = Math.floor((elapsed % millisecondsInHour) / millisecondsInMinute);
  const seconds = Math.floor((elapsed % millisecondsInMinute) / 1000);

  return [days, hours, minutes, seconds];
};

export const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  expiredText = 'נגמר הזמן',
  allowNegativeValues,
  ...props
}) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);
  const [upDays, upHours, upMinutes, upSeconds] = useStopwatch(targetDate);

  if (days + hours + minutes + seconds < 0) {
    if (allowNegativeValues) {
      return (
        <Typography {...props}>
          -{(upMinutes + upHours * 60 + upDays * 24 * 60).toString().padStart(2, '0')}:
          {upSeconds.toString().padStart(2, '0')}
        </Typography>
      );
    }
    return <Typography {...props}>{expiredText}</Typography>;
  } else {
    return (
      <Typography {...props}>
        {allowNegativeValues && '+'}
        {(minutes + hours * 60 + days * 24 * 60).toString().padStart(2, '0')}:
        {seconds.toString().padStart(2, '0')}
      </Typography>
    );
  }
};

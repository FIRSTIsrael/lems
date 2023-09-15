import { Typography, TypographyProps } from '@mui/material';
import useCountdown from '../../hooks/use-countdown';
import useStopwatch from '../../hooks/use-stopwatch';
interface CountdownProps extends TypographyProps {
  targetDate: Date;
  expiredText?: string;
  allowNegativeValues?: boolean;
}

const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  expiredText,
  allowNegativeValues,
  ...props
}) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);
  const [upDays, upHours, upMinutes, upSeconds] = useStopwatch(targetDate);

  if (days + hours + minutes + seconds <= 0) {
    if (allowNegativeValues) {
      return (
        <Typography {...props}>
          {'-'}
          {(upMinutes + upHours * 60 + upDays * 24 * 60).toString().padStart(2, '0')}:
          {upSeconds.toString().padStart(2, '0')}
        </Typography>
      );
    }
    return <Typography {...props}>{expiredText ? expiredText : 'נגמר הזמן'}</Typography>;
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

export default Countdown;

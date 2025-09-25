import { Typography, TypographyProps } from '@mui/material';
import useCountdown from '../hooks/use-countdown';

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

  if (days + hours + minutes + seconds < 0) {
    return <Typography {...props}>{expiredText ? expiredText : 'Time Expired'}</Typography>;
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

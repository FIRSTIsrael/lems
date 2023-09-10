import useCountdown from '../../hooks/use-countdown';
import { Typography, TypographyProps } from '@mui/material';

interface CountdownProps extends TypographyProps {
  targetDate: Date;
  expiredText?: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, expiredText, ...props }) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);

  if (days + hours + minutes + seconds <= 0) {
    return <Typography {...props}>{expiredText ? expiredText : 'נגמר הזמן'}</Typography>;
  } else {
    return (
      <Typography {...props}>
        {(minutes + hours * 60 + days * 24 * 60).toString().padStart(2, '0')}:
        {seconds.toString().padStart(2, '0')}
      </Typography>
    );
  }
};

export default Countdown;

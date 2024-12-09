import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Paper, Typography, Box } from '@mui/material';
import Countdown from '../../general/countdown';
import { useTime } from '../../../hooks/use-time';
import { INSPECTION_TIMER_LENGTH, SHOW_INSPECTION_TIMER } from '@lems/types';

interface InspectionTimerProps {
  startTime: Date;
}

const InspectionTimer: React.FC<InspectionTimerProps> = ({ startTime }) => {
  if (!SHOW_INSPECTION_TIMER) {
    return null;
  }

  const currentTime = useTime({ interval: 100 });
  const inspectionEnd = dayjs(startTime).add(INSPECTION_TIMER_LENGTH, 'seconds');

  const percentLeft = useMemo(
    () => inspectionEnd.diff(currentTime) / (10 * INSPECTION_TIMER_LENGTH),
    [currentTime, inspectionEnd]
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 10,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 2,
          bgcolor: 'white',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: '120px',
          boxShadow:'0 0, -15px 0 30px -10px #ff66017e, 0 0 30px -10px #c4007952, 15px 0 30px -10px #2b01d447',
        }}
      >
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          ביקורת ציוד
        </Typography>
        <Countdown
          targetDate={inspectionEnd.toDate()}
          expiredText="00:00"
          variant="h6"
        />
      </Paper>
    </Box>
  );
};

export default InspectionTimer;

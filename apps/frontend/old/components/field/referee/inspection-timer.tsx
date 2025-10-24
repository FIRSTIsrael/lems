import dayjs from 'dayjs';
import { Paper, Typography } from '@mui/material';
import { INSPECTION_TIMER_LENGTH } from '@lems/types';
import Countdown from '../../general/countdown';

interface InspectionTimerProps {
  startTime: Date;
}

const InspectionTimer: React.FC<InspectionTimerProps> = ({ startTime }) => {
  const inspectionEnd = dayjs(startTime).add(INSPECTION_TIMER_LENGTH, 'seconds');

  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'fixed',
        bottom: 20,
        left: 20,
        boxShadow:
          '0 0, -15px 0 30px -10px #ff66017e, 0 0 30px -10px #c4007952, 15px 0 30px -10px #2b01d447'
      }}
    >
      <Typography variant="subtitle1" fontWeight={500} gutterBottom>
        ביקורת ציוד
      </Typography>
      <Countdown targetDate={inspectionEnd.toDate()} expiredText="00:00" variant="h6" />
    </Paper>
  );
};

export default InspectionTimer;

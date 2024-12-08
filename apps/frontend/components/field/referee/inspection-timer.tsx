import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Paper, Typography, Box } from '@mui/material';
import Countdown from '../../general/countdown';
import { useTime } from '../../../hooks/use-time';

interface InspectionTimerProps {
  startTime: string;
}

const INSPECTION_LENGTH = 90; // 1.5 minutes in seconds

const InspectionTimer: React.FC<InspectionTimerProps> = ({ startTime }) => {
  const currentTime = useTime({ interval: 100 });
  const inspectionEnd = dayjs(startTime).add(INSPECTION_LENGTH, 'seconds');

  const percentLeft = useMemo(
    () => inspectionEnd.diff(currentTime) / (10 * INSPECTION_LENGTH),
    [currentTime, inspectionEnd]
  );

  if (percentLeft <= 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 'auto',
        left: 16,
        zIndex: 1000,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          py: 1,
          px: 2,
          bgcolor: 'info.main',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: '120px'
        }}
      >
        <Typography variant="caption" color="info.contrastText" gutterBottom>
          זמן בדיקה
        </Typography>
        <Countdown
          targetDate={inspectionEnd.toDate()}
          expiredText="00:00"
          variant="h6"
          fontFamily="Roboto Mono"
          sx={{ color: 'info.contrastText' }}
        />
      </Paper>
    </Box>
  );
};

export default InspectionTimer;

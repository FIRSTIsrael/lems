import { useMemo } from 'react';
import { CATEGORY_DELIBERATION_LENGTH, JudgingDeliberation } from '@lems/types';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import dayjs from 'dayjs';
import Countdown from '../general/countdown';
import { useTime } from '../../hooks/use-time';
import { WithId } from 'mongodb';

interface DeliberationTimerProps {
  deliberation: WithId<JudgingDeliberation>;
  startDeliberation: (divisionId: string, deliberationId: string) => void;
}

const DeliberationTimer: React.FC<DeliberationTimerProps> = ({
  deliberation,
  startDeliberation
}) => {
  const endTime = deliberation.startTime
    ? dayjs(deliberation.startTime).add(CATEGORY_DELIBERATION_LENGTH, 'seconds')
    : undefined;
  const currentTime = useTime({ interval: 1000 });
  const progress = useMemo(() => {
    switch (deliberation.status) {
      case 'not-started':
        return 0;
      case 'in-progress':
        if (!endTime || endTime < dayjs()) {
          return 100;
        }
        return (endTime.diff(currentTime, 'seconds') / CATEGORY_DELIBERATION_LENGTH) * 100;
      case 'completed':
        return 100;
    }
  }, [deliberation.status, endTime]);
  const progressColor = useMemo(() => {
    switch (deliberation.status) {
      case 'not-started':
        return 'primary';
      case 'in-progress':
        if (!endTime || endTime < dayjs()) {
          return 'error';
        }
        return 'primary';
      case 'completed':
        return 'success';
    }
  }, [deliberation.status]);

  return (
    <Box
      sx={{
        marginTop: 5,
        position: 'relative',
        display: 'inline-flex',
        width: '100%',
        justifyContent: 'center'
      }}
    >
      <CircularProgress
        variant="determinate"
        value={progress}
        color={progressColor}
        size={250}
        sx={{ '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {deliberation.status === 'not-started' ? (
          <IconButton
            onClick={() =>
              startDeliberation(deliberation.divisionId.toString(), deliberation._id.toString())
            }
          >
            <PlayCircleOutlinedIcon sx={{ width: '8rem', height: '8rem' }} color="primary" />
          </IconButton>
        ) : deliberation.status === 'in-progress' ? (
          endTime && (
            <Countdown
              targetDate={endTime.toDate()}
              fontSize="3.5rem"
              fontWeight={600}
              textAlign="center"
              expiredText="00:00"
            />
          )
        ) : (
          <Typography fontWeight={600} fontSize="2rem">
            הדיון הסתיים
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DeliberationTimer;

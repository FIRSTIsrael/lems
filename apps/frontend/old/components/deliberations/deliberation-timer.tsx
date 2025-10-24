import { useMemo } from 'react';
import {
  CATEGORY_DELIBERATION_LENGTH,
  CHAMPIONS_DELIBERATION_STAGE_LENGTH,
  CORE_AWARDS_DELIBERATION_STAGE_LENGTH,
  OPTIONAL_AWARDS_DELIBERATION_STAGE_LENGTH,
  JudgingDeliberation
} from '@lems/types';
import {
  Box,
  CircularProgress,
  LinearProgress,
  IconButton,
  Typography,
  Stack
} from '@mui/material';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import Countdown from '../general/countdown';
import { useTime } from '../../hooks/time/use-time';

interface TimerProps {
  progress: number;
  progressColor: 'primary' | 'error' | 'success';
  deliberation: WithId<JudgingDeliberation>;
  startDeliberation: () => void;
  endTime?: dayjs.Dayjs;
}

const CircularTimer: React.FC<TimerProps> = ({
  deliberation,
  progress,
  progressColor,
  startDeliberation,
  endTime
}) => {
  return (
    <Box
      sx={{
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
          <IconButton onClick={() => startDeliberation()}>
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

const LinearTimer: React.FC<TimerProps> = ({
  deliberation,
  progress,
  progressColor,
  startDeliberation,
  endTime
}) => {
  return (
    <Stack alignItems="center" spacing={2} direction="row">
      <LinearProgress
        variant="determinate"
        value={progress}
        color={progressColor}
        sx={{ height: 15, borderRadius: 5, width: '100%' }}
      />
      <Box minWidth={96}>
        {deliberation.status === 'not-started' ? (
          <IconButton onClick={() => startDeliberation()}>
            <PlayCircleOutlinedIcon sx={{ width: '3rem', height: '3rem' }} color="primary" />
          </IconButton>
        ) : deliberation.status === 'in-progress' ? (
          endTime && (
            <Countdown
              targetDate={endTime.toDate()}
              fontSize="1.5rem"
              fontWeight={600}
              textAlign="center"
              expiredText="00:00"
            />
          )
        ) : (
          <Typography fontWeight={600} fontSize="1rem">
            הדיון הסתיים
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

interface DeliberationTimerProps {
  deliberation: WithId<JudgingDeliberation>;
  startDeliberation: () => void;
  variant?: 'circular' | 'linear';
}

const DeliberationTimer: React.FC<DeliberationTimerProps> = ({
  deliberation,
  startDeliberation,
  variant = 'circular'
}) => {
  const getLength = () => {
    if (!deliberation.isFinalDeliberation) return CATEGORY_DELIBERATION_LENGTH;
    switch (deliberation.stage) {
      case 'champions':
        return CHAMPIONS_DELIBERATION_STAGE_LENGTH;
      case 'core-awards':
        return CORE_AWARDS_DELIBERATION_STAGE_LENGTH;
      case 'optional-awards':
        return OPTIONAL_AWARDS_DELIBERATION_STAGE_LENGTH;
      default:
        return 0;
    }
  };

  const endTime = deliberation.startTime
    ? dayjs(deliberation.startTime).add(getLength(), 'seconds')
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
        return (endTime.diff(currentTime, 'seconds') / getLength()) * 100;
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
  }, [deliberation.status, endTime]);

  return variant === 'circular' ? (
    <CircularTimer
      deliberation={deliberation}
      startDeliberation={startDeliberation}
      progress={progress}
      progressColor={progressColor}
      endTime={endTime}
    />
  ) : (
    <LinearTimer
      deliberation={deliberation}
      startDeliberation={startDeliberation}
      progress={progress}
      progressColor={progressColor}
      endTime={endTime}
    />
  );
};

export default DeliberationTimer;

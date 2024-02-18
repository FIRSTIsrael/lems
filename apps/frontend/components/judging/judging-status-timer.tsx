import { useMemo } from 'react';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { Team, JudgingSession } from '@lems/types';
import Countdown from '../../components/general/countdown';
import { useTime } from '../../hooks/use-time';

interface JudgingStatusTimerProps {
  currentSessions: Array<WithId<JudgingSession>>;
  nextSessions: Array<WithId<JudgingSession>>;
  teams: Array<WithId<Team>>;
}

const JudgingStatusTimer: React.FC<JudgingStatusTimerProps> = ({
  currentSessions,
  nextSessions,
  teams
}) => {
  const currentTime = useTime({ interval: 1000 });
  const fiveMinutes = 5 * 60;

  const getStatus = useMemo<'ahead' | 'close' | 'behind' | 'done'>(() => {
    if (nextSessions.length > 0) {
      if (dayjs(nextSessions[0].scheduledTime) > currentTime) {
        return dayjs(nextSessions[0].scheduledTime).diff(currentTime, 'seconds') > fiveMinutes
          ? 'ahead'
          : 'close';
      }
      return 'behind';
    }
    return 'done';
  }, [currentTime, fiveMinutes, nextSessions]);

  const progressToNextSessionStart = useMemo(() => {
    if (nextSessions.length > 0) {
      const diff = dayjs(nextSessions[0].scheduledTime).diff(currentTime, 'seconds');
      return (Math.abs(Math.min(fiveMinutes, diff)) / fiveMinutes) * 100;
    }
    return 0;
  }, [currentTime, fiveMinutes, nextSessions]);

  const getCountdownTarget = (startTime: Date) => dayjs(startTime).toDate();

  return (
    <>
      <Paper
        sx={{
          py: 4,
          px: 2,
          textAlign: 'center',
          mt: 4
        }}
      >
        <Stack spacing={2}>
          {nextSessions.length > 0 && (
            <Countdown
              allowNegativeValues={true}
              targetDate={getCountdownTarget(nextSessions[0].scheduledTime)}
              variant="h1"
              fontFamily={'Roboto Mono'}
              fontSize="10rem"
              fontWeight={700}
              dir="ltr"
            />
          )}
          {currentSessions.filter(s => s.status === 'in-progress').length > 0 && (
            <Typography variant="h4">
              {currentSessions.filter(session => !!session.startTime).length} מתוך{' '}
              {
                currentSessions.filter(
                  session => teams.find(team => team._id === session.teamId)?.registered
                ).length
              }{' '}
              קבוצות בחדר השיפוט
            </Typography>
          )}
        </Stack>
      </Paper>
      {getStatus !== 'done' && (
        <LinearProgress
          color={getStatus === 'ahead' ? 'success' : getStatus === 'close' ? 'warning' : 'error'}
          variant="determinate"
          value={progressToNextSessionStart}
          sx={{
            height: 16,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            mt: -2
          }}
        />
      )}
    </>
  );
};

export default JudgingStatusTimer;

import { useState, useMemo, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { WithId } from 'mongodb';
import { LinearProgress, Paper, Typography } from '@mui/material';
import { RobotGameMatch, RobotGameMatchParticipant, MATCH_LENGTH } from '@lems/types';
import Countdown from '../../general/countdown';
import { localizeTeam } from '../../../localization/teams';

interface TimerProps {
  participant: RobotGameMatchParticipant;
  match: WithId<RobotGameMatch>;
}

const Timer: React.FC<TimerProps> = ({ participant, match }) => {
  const matchEnd = dayjs(match.startTime).add(MATCH_LENGTH, 'seconds');
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(dayjs()), 100);
    return () => {
      clearInterval(interval);
    };
  });

  const percentLeft = useMemo(
    () => matchEnd.diff(currentTime) / (10 * MATCH_LENGTH),
    [currentTime, matchEnd]
  );

  return (
    <>
      <Paper sx={{ mt: 4, py: 4, px: 2, textAlign: 'center' }}>
        <Countdown
          targetDate={matchEnd.toDate()}
          expiredText="00:00"
          variant="h1"
          fontFamily={'Roboto Mono'}
          fontSize="5rem"
          fontWeight={700}
          dir="ltr"
        />
        {participant.team && (
          <Typography variant="h4" fontSize="1.5rem" fontWeight={400} gutterBottom>
            {localizeTeam(participant.team)}
          </Typography>
        )}
      </Paper>
      <LinearProgress
        variant="determinate"
        value={percentLeft}
        color={percentLeft <= 20 ? 'error' : 'primary'}
        sx={{
          height: 16,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          mt: -2
        }}
      />
    </>
  );
};

export default Timer;

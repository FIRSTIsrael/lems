import { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { Typography, Paper, LinearProgress, LinearProgressProps } from '@mui/material';
import { JUDGING_SESSION_LENGTH, JudgingSession, Team } from '@lems/types';
import useCountdown from '../../hooks/use-countdown';
import Countdown from '../general/countdown';
import { localizeTeam } from '../../localization/teams';

interface TimerProps {
  session: JudgingSession;
  team: Team;
}

const JudgingTimer: React.FC<TimerProps> = ({ session, team }) => {
  const sessionEnd = dayjs(session.startTime).add(JUDGING_SESSION_LENGTH, 'seconds');
  const [, , minutes, seconds] = useCountdown(sessionEnd.toDate());

  const secondsJudging: number = useMemo(() => {
    return JUDGING_SESSION_LENGTH - (minutes * 60 + seconds);
  }, [minutes, seconds]);

  const stageText = useMemo(() => {
    let currentSeconds = secondsJudging;

    const stages = [
      { duration: 60, text: 'דקת התארגנות' },
      { duration: 5 * 60, text: 'הצגה - פרויקט החדשנות' },
      { duration: 5 * 60, text: 'שאלות - פרויקט החדשנות' },
      { duration: 5 * 60, text: 'הצגה - תכנון הרובוט' },
      { duration: 5 * 60, text: 'שאלות - תכנון הרובוט' },
      { duration: 3 * 60, text: 'שיקוף - ערכי הליבה' },
      { duration: 3 * 60, text: 'שאלות - ערכי הליבה' }
    ];

    for (const stage of stages) {
      if (currentSeconds <= stage.duration) {
        return stage.text;
      }
      currentSeconds -= stage.duration;
    }

    return 'נגמר הזמן!';
  }, [secondsJudging]);

  const { barColor, barProgress, soundId } = useMemo(() => {
    let currentSeconds = secondsJudging;

    const stages = [
      { duration: 60, color: 'inherit', id: 1 },
      { duration: 5 * 60, color: 'primary', id: 2 },
      { duration: 5 * 60, color: 'primary', id: 3 },
      { duration: 5 * 60, color: 'success', id: 4 },
      { duration: 5 * 60, color: 'success', id: 5 },
      { duration: 3 * 60, color: 'error', id: 6 },
      { duration: 3 * 60, color: 'error', id: 7 }
    ];

    for (const stage of stages) {
      if (currentSeconds <= stage.duration) {
        return {
          barColor: stage.color,
          barProgress: 100 - (currentSeconds / stage.duration) * 100,
          soundId: stage.id
        };
      }
      currentSeconds -= stage.duration;
    }

    return { barColor: 'inherit', barProgress: 100 };
  }, [secondsJudging]);

  useEffect(() => {
    if (secondsJudging === JUDGING_SESSION_LENGTH) {
      new Audio('/assets/sounds/judging/judging-end.wav').play();
    }
  }, [secondsJudging]);

  useEffect(() => {
    if (soundId !== 1) new Audio('/assets/sounds/judging/judging-change.wav').play();
  }, [soundId]);

  return (
    <Paper
      sx={{
        py: 4,
        px: 2,
        textAlign: 'center',
        mt: 4
      }}
    >
      <LinearProgress
        variant="determinate"
        value={barProgress}
        color={barColor as LinearProgressProps['color']}
        sx={{
          height: 16,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          mx: -2,
          mt: -4
        }}
      />
      <Countdown
        targetDate={sessionEnd.toDate()}
        expiredText="00:00"
        variant="h1"
        fontFamily={'Roboto Mono'}
        fontSize="10rem"
        fontWeight={700}
        dir="ltr"
      />
      <Typography variant="h2" fontSize="4rem" fontWeight={400} gutterBottom>
        {stageText}
      </Typography>
      <Typography variant="h4" fontSize="1.5rem" fontWeight={400} gutterBottom>
        {localizeTeam(team)}
      </Typography>
      <Typography
        variant="body1"
        fontSize="1rem"
        fontWeight={600}
        sx={{ color: '#666' }}
        gutterBottom
      >
        מפגש השיפוט יסתיים בשעה {sessionEnd.format('HH:mm')}
      </Typography>
    </Paper>
  );
};

export default JudgingTimer;

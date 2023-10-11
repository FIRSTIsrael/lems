import { Grid2Props, Paper, Typography, LinearProgress } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs, { Dayjs } from 'dayjs';
import { WithId } from 'mongodb';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { RobotGameMatch, MATCH_LENGTH } from '@lems/types';
import Countdown from '../../general/countdown';

interface ScoreboardCurrentMatchProps extends Grid2Props {
  activeMatch: WithId<RobotGameMatch> | undefined;
}

const ScoreboardCurrentMatch: React.FC<ScoreboardCurrentMatchProps> = ({
  activeMatch,
  ...props
}) => {
  const matchEnd = dayjs(activeMatch?.startTime).add(MATCH_LENGTH, 'seconds');
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

  useEffect(() => {
    percentLeft === 20 && new Audio('/assets/sounds/field/field-endgame.wav').play();
  }, [percentLeft]);

  return (
    <>
      <Grid container direction="row">
        <Grid xs={3} position="relative">
          <Image
            fill
            style={{ objectFit: 'contain', padding: 16 }}
            src="/assets/audience-display/first-israel-horizontal.svg"
            alt="לוגו של FIRST ישראל"
          />
        </Grid>
        <Grid
          container
          component={Paper}
          {...props}
          xs={6}
          p={2}
          alignItems="center"
          direction="row"
        >
          <Grid xs={3}>
            <Typography component="h2" fontSize="1.75rem" fontWeight={500}>
              מקצה נוכחי
            </Typography>
            <Typography fontSize="2.5rem" fontWeight={700}>
              {activeMatch?.number
                ? `מקצה #${activeMatch?.number}`
                : activeMatch?.stage === 'test'
                ? 'מקצה בדיקה'
                : '-'}
            </Typography>
          </Grid>
          <Grid xs={9} display="flex" justifyContent="center">
            {activeMatch?.startTime && (
              <Countdown
                targetDate={matchEnd.toDate()}
                expiredText="00:00"
                fontFamily={'Roboto Mono'}
                fontSize="4rem"
                fontWeight={700}
                alignSelf="center"
              />
            )}
          </Grid>
        </Grid>
        <Grid xs={3} position="relative">
          <Image
            fill
            style={{ objectFit: 'contain', padding: 8 }}
            src="/assets/audience-display/technion-horizontal.svg"
            alt="לוגו של הטכניון"
          />
        </Grid>
      </Grid>
      <Grid container justifyContent="center">
        <Grid xs={6}>
          {activeMatch?.startTime && (
            <LinearProgress
              variant="determinate"
              value={percentLeft}
              color={percentLeft <= 20 ? 'error' : 'primary'}
              sx={{
                height: 16,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                mt: -3
              }}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default ScoreboardCurrentMatch;

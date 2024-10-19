import { useMemo } from 'react';
import Image from 'next/image';
import { Grid2Props, Paper, Typography, LinearProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { RobotGameMatch, MATCH_LENGTH } from '@lems/types';
import Countdown from '../../general/countdown';
import { useTime } from '../../../hooks/use-time';
import { localizedMatchStage } from '../../../localization/field';

interface ScoreboardCurrentMatchProps extends Grid2Props {
  activeMatch: WithId<RobotGameMatch> | undefined;
  showTimer?: boolean;
}

const ScoreboardCurrentMatch: React.FC<ScoreboardCurrentMatchProps> = ({
  activeMatch,
  showTimer = true,
  ...props
}) => {
  const currentTime = useTime({ interval: 100 });
  const matchEnd = dayjs(activeMatch?.startTime).add(MATCH_LENGTH, 'seconds');

  const percentLeft = useMemo(
    () => matchEnd.diff(currentTime) / (10 * MATCH_LENGTH),
    [currentTime, matchEnd]
  );

  return (<>
    <Grid container direction="row">
      <Grid position="relative" size={3}>
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
        p={2}
        alignItems="center"
        direction="row"
        size={6}
      >
        <Grid size={showTimer ? 3 : 12}>
          <Typography
            component="h2"
            fontSize="1.75rem"
            fontWeight={500}
            textAlign={showTimer ? 'left' : 'center'}
          >
            מקצה נוכחי
          </Typography>
          <Typography
            fontSize="2.5rem"
            fontWeight={700}
            textAlign={showTimer ? 'left' : 'center'}
          >
            {activeMatch?.number
              ? `מקצה ${activeMatch && localizedMatchStage[activeMatch.stage]} #${activeMatch?.number}`
              : activeMatch?.stage === 'test'
                ? 'מקצה בדיקה'
                : '-'}
          </Typography>
        </Grid>
        {showTimer && (
          <Grid display="flex" justifyContent="center" size={9}>
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
        )}
      </Grid>
      <Grid position="relative" size={3}>
        <Image
          fill
          style={{ objectFit: 'contain', padding: 8 }}
          src="/assets/audience-display/technion-horizontal.svg"
          alt="לוגו של הטכניון"
        />
      </Grid>
    </Grid>
    {showTimer && (
      <Grid container justifyContent="center">
        <Grid size={6}>
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
    )}
  </>);
};

export default ScoreboardCurrentMatch;

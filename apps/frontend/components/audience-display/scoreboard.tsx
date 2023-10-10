import { EventState, MATCH_LENGTH, RobotGameMatch, Scoresheet } from '@lems/types';
import { WithId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import { LinearProgress, Paper, Stack, Typography } from '@mui/material';
import Countdown from '../general/countdown';
import dayjs, { Dayjs } from 'dayjs';
import { useState, useEffect, useMemo } from 'react';

interface ScoreboardProps {
  activeMatch: WithId<RobotGameMatch>;
  scoresheets: Array<WithId<Scoresheet>>;
  eventState: EventState;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ activeMatch, scoresheets, eventState }) => {
  const matchEnd = dayjs(activeMatch.startTime).add(MATCH_LENGTH, 'seconds');
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
    <Stack py={4} spacing={0} height="100vh">
      <Grid container xs={12} direction="row" justifyContent="space-between" minHeight={250}>
        <Grid
          xs={5}
          component={Paper}
          p={2}
          justifyContent="center"
          alignItems="flex-start"
          display="flex"
          flexDirection="column"
        >
          <Typography component="h2" fontSize="1.75rem" fontWeight={500}>
            מקצה נוכחי
          </Typography>
          <Typography fontSize="2.5rem" fontWeight={700}>
            {activeMatch.number
              ? `מקצה #${activeMatch.number}`
              : activeMatch.type === 'test'
              ? 'מקצה בדיקה'
              : '-'}
          </Typography>
          {activeMatch.startTime && (
            <Countdown
              targetDate={matchEnd.toDate()}
              expiredText="00:00"
              fontFamily={'Roboto Mono'}
              fontSize="5rem"
              fontWeight={700}
              alignSelf="center"
            />
          )}
        </Grid>
        <Grid xs={5} component={Paper}>
          Text Here
        </Grid>
      </Grid>
      <Grid container xs={12}>
        <Grid xs={5}>
          {activeMatch.startTime && (
            <LinearProgress
              variant="determinate"
              value={percentLeft}
              color={percentLeft <= 20 ? 'error' : 'primary'}
              sx={{
                width: 'auto',
                height: 16,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                mt: -1
              }}
            />
          )}
        </Grid>
      </Grid>
      <Paper sx={{ p: 2, height: '100%', mt: 8 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc pellentesque tellus a viverra
        placerat. Fusce iaculis, purus sed vehicula bibendum, enim lacus aliquet dolor, ac mattis
        purus nunc sed neque. Ut id gravida turpis. Cras quis orci cursus, feugiat dolor eget,
        sagittis eros. Vestibulum porttitor volutpat ligula, vitae scelerisque sem dapibus nec.
        Quisque placerat ipsum at mi placerat semper. Suspendisse urna mi, pulvinar eget nisl in,
        gravida commodo lacus. Nunc eleifend ultricies ligula, sed pulvinar urna finibus vel. Cras
        tincidunt cursus ipsum sed aliquet. Proin malesuada sit amet tortor nec bibendum. Mauris
        finibus a velit vulputate rutrum. Praesent placerat felis id arcu tincidunt lobortis id non
        turpis. Phasellus eu hendrerit augue. Aenean lacinia erat quam, id euismod justo viverra
        quis. Nam suscipit metus eget maximus consequat. Mauris quam nunc, dapibus in lacinia
        posuere, feugiat nec augue. Fusce libero erat, malesuada vel condimentum vel, suscipit eget
        felis. Sed quis lorem nibh. Suspendisse dui odio, venenatis at arcu at, sagittis aliquam ex.
        Nunc id risus vel quam luctus pellentesque. Vestibulum fermentum vel nisi eget sodales.
        Suspendisse eleifend fringilla sodales. Aliquam scelerisque suscipit tellus a tristique.
        Praesent hendrerit turpis vel arcu sodales, id vestibulum sem tempus. Ut vel cursus lorem.
        Donec sed felis at mauris pharetra dignissim sed sit amet ipsum. Mauris consequat eros ut
        pharetra feugiat. Pellentesque habitant morbi tristique senectus et netus et malesuada fames
        ac turpis egestas. Sed finibus feugiat nunc quis faucibus. Fusce eu congue erat. Nam eget mi
        sed justo viverra laoreet. Donec et euismod velit. Maecenas id orci facilisis, molestie quam
        sed, aliquet dolor. Sed sodales dolor sit amet sem vehicula, eget condimentum nibh commodo.
        Nam condimentum leo vel sapien porttitor, condimentum iaculis enim efficitur. Pellentesque
        habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur
        vel egestas urna. Orci varius natoque penatibus et magnis dis parturient montes, nascetur
        ridiculus mus. Sed dictum mi eget dolor sodales rhoncus. Fusce mi dolor, malesuada ac odio
        quis, sagittis euismod nunc. Praesent in nibh nec quam ultrices rutrum. Morbi nec orci
        neque. Donec lobortis at dui id laoreet. Aliquam porta aliquam vestibulum. Integer volutpat
        ex in sem convallis, vitae euismod diam lacinia. Proin vulputate pellentesque dui sed
        fringilla. Nulla eleifend ligula ac nunc tincidunt, at hendrerit lacus ultrices. Nam ac nisl
        sit amet libero tincidunt efficitur. Nam et luctus mi. Nunc ut orci eleifend turpis
        venenatis ultrices eu a tellus. Ut sagittis laoreet diam, ut maximus turpis dictum id.
        Pellentesque ac dolor nunc. Ut sit amet tellus eget sem volutpat rutrum non non sem. Etiam
        posuere aliquam elit vitae vestibulum. Ut sagittis pretium nisi lobortis auctor. Donec
        tristique suscipit consequat. Aliquam accumsan aliquet justo, nec tristique enim bibendum
        nec. Quisque in lacus in tellus laoreet venenatis.
      </Paper>
    </Stack>
  );
};

export default Scoreboard;

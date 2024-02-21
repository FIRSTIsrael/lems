import { WithId } from 'mongodb';
import { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Appear, Slide } from '@lems/presentations';
import { DivisionColor, Team } from '@lems/types';
import { getDivisionColor } from '../../lib/utils/colors';
import LogoStack from './logo-stack';
import { localizeTeam } from '../../localization/teams';

interface AdvancingTeamsSlideProps {
  teams: Array<WithId<Team>>;
  color?: DivisionColor;
}

const AdvancingTeamsSlide: React.FC<AdvancingTeamsSlideProps> = ({ teams, color }) => {
  const COLUMN_SPLIT_THRESHOLD = 11;
  const splitTeamsIntoColumns = useMemo(() => teams.length > COLUMN_SPLIT_THRESHOLD, [teams]);

  return (
    <Slide>
      <Stack
        height="calc(100% - 100)"
        width={splitTeamsIntoColumns ? '100%' : '70%'}
        alignItems={'center'}
        sx={{ position: 'absolute', top: 15 }}
      >
        <Typography variant="h1" fontSize="6rem" textAlign="center" gutterBottom>
          קבוצות המעפילות שלב
        </Typography>
        <Box
          sx={{
            background: '#f7f8f9',
            mx: 4,
            px: 4,
            py: 4,
            borderRadius: 4,
            boxShadow: color && `-20px 20px 24px ${getDivisionColor(color)}74`
          }}
        >
          <Grid container columns={splitTeamsIntoColumns ? 2 : 1} spacing={1}>
            {teams.map(team => (
              <Grid key={team._id.toString()} xs={1}>
                <Appear>
                  <Typography
                    fontSize={splitTeamsIntoColumns ? '2rem' : '2.35rem'}
                    fontWeight={500}
                  >
                    {localizeTeam(team)}
                  </Typography>
                </Appear>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
      <LogoStack />
    </Slide>
  );
};

export default AdvancingTeamsSlide;

import { WithId } from 'mongodb';
import { Box, Typography, Container, Stack, ThemeProvider, createTheme } from '@mui/material';
import { DivisionWithEvent, Team, Scoresheet } from '@lems/types';
import { SEASON_SCORESHEET } from '@lems/season';
import { ScoresheetHeader } from './scoresheet-header';
import { ScoresheetMission } from './scoresheet-mission';

interface ExportScoresheetPageProps {
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  scoresheet: WithId<Scoresheet>;
}

export const ExportScoresheetPage: React.FC<ExportScoresheetPageProps> = ({
  division,
  team,
  scoresheet
}) => {
  const theme = createTheme({
    direction: 'rtl',
    typography: {
      fontFamily: 'var(--font-rubik)'
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <ScoresheetHeader division={division} team={team} scoresheet={scoresheet} />
        <Stack spacing={1.5}>
          {SEASON_SCORESHEET.missions.map((mission, index) => (
            <ScoresheetMission
              scoresheet={scoresheet}
              key={mission.id}
              missionIndex={index}
              mission={mission}
            />
          ))}
          <Box display="flex" justifyContent="center" mt={1}>
            <Typography fontSize="1.5rem" fontWeight={700}>
              {scoresheet.data?.score} נקודות
            </Typography>
          </Box>
        </Stack>
      </Container>
    </ThemeProvider>
  );
};

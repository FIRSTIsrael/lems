'use client';

import { Paper, Table, TableBody, TableContainer, alpha } from '@mui/material';
import { useScoreboard } from '../scoreboard-context';
import { useScoreboardRounds } from '../hooks/use-scoreboard-rounds';
import { useTeamScores } from '../hooks/use-team-scores';
import { useInfiniteScroll } from '../hooks/use-infinite-scroll';
import { ScoresTableHeader } from './scores-table-header';
import { ScoresTableRow } from './scores-table-row';

const SCROLL_DURATION = 70;

export const ScoresTable = () => {
  const { matches, scoresheets, currentStage } = useScoreboard();
  const rounds = useScoreboardRounds(scoresheets, currentStage);
  const teamScores = useTeamScores(scoresheets, matches, currentStage);
  const tableBodyRef = useInfiniteScroll(SCROLL_DURATION);

  const tableContent = teamScores.map((team, index) => (
    <ScoresTableRow key={team.teamId} team={team} index={index} />
  ));

  return (
    <Paper
      sx={{
        bgcolor: theme => alpha(theme.palette.background.paper, 0.95),
        borderRadius: 1.5,
        overflow: 'hidden',
        height: '100%',
        width: '100%'
      }}
    >
      <TableContainer>
        <Table stickyHeader>
          <ScoresTableHeader rounds={rounds} />
          <TableBody
            ref={tableBodyRef}
            sx={{
              animation: `scroll-up ${SCROLL_DURATION}s linear infinite`,
              '@keyframes scroll-up': {
                '0%': {
                  transform: 'translateY(0)'
                },
                '100%': {
                  transform: 'translateY(-50%)'
                }
              }
            }}
          >
            {tableContent}
            {tableContent}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

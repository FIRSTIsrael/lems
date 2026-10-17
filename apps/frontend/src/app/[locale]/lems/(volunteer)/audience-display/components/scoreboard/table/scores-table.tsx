'use client';

import { Paper, Table, TableBody, TableContainer, alpha } from '@mui/material';
import { getRankingStrategy, getScoreboardRoundCount } from '@lems/shared/utils';
import { useScoreboard } from '../scoreboard-context';
import { useTeamScores } from '../hooks/use-team-scores';
import { useInfiniteScroll } from '../hooks/use-infinite-scroll';
import { useEdition } from '../../../../hooks/use-edition';
import { ScoresTableHeader } from './scores-table-header';
import { ScoresTableRow } from './scores-table-row';

const SCROLL_DURATION = 70;

export const ScoresTable = () => {
  const { matches, scoresheets, currentStage, rankingRoundCount } = useScoreboard();
  const rankingStrategy = getRankingStrategy(useEdition());
  const roundCount = getScoreboardRoundCount(
    currentStage,
    rankingRoundCount,
    scoresheets
      .filter(scoresheet => scoresheet.stage === currentStage && scoresheet.status === 'submitted')
      .map(scoresheet => scoresheet.round)
  );
  const rounds = Array.from({ length: roundCount }, (_, index) => ({
    stage: currentStage,
    round: index + 1
  }));
  const teamScores = useTeamScores(scoresheets, matches, currentStage, roundCount, rankingStrategy);
  const tableBodyRef = useInfiniteScroll(SCROLL_DURATION);

  const tableContent = teamScores.map((team, index) => (
    <ScoresTableRow key={team.teamId} team={team} index={index} rankingStrategy={rankingStrategy} />
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
          <ScoresTableHeader rounds={rounds} rankingStrategy={rankingStrategy} />
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

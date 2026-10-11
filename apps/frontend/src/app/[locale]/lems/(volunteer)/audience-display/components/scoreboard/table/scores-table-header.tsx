import { TableCell, TableHead, TableRow, alpha } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMatchTranslations } from '@lems/localization';
import type { RankingStrategy } from '@lems/shared/utils';

interface ScoreboardRound {
  stage: string;
  round: number;
}

interface ScoresTableHeaderProps {
  rounds: ScoreboardRound[];
  rankingStrategy: RankingStrategy;
}

export const ScoresTableHeader = ({ rounds, rankingStrategy }: ScoresTableHeaderProps) => {
  const t = useTranslations('pages.audience-display.scoreboard.scores-table');
  const headlineScoreT = useTranslations('robot-game.headline-score');
  const { getStage } = useMatchTranslations();

  return (
    <TableHead sx={{ bgcolor: theme => alpha(theme.palette.primary.main, 0.08) }}>
      <TableRow sx={{ bgcolor: theme => alpha(theme.palette.primary.main, 0.08) }}>
        <TableCell align="center" sx={{ fontWeight: 700, py: 1.5, fontSize: '1.25rem' }}>
          {t('rank')}
        </TableCell>
        <TableCell sx={{ fontWeight: 700, py: 1.5, fontSize: '1.25rem' }} width="35%">
          {t('team')}
        </TableCell>
        {rounds.map(round => (
          <TableCell
            key={`round-${round.stage}-${round.round}`}
            align="center"
            sx={{ fontWeight: 700, py: 1.5, fontSize: '1.25rem' }}
          >
            {`${getStage(round.stage)} #${round.round}`}
          </TableCell>
        ))}
        <TableCell align="center" sx={{ fontWeight: 700, py: 1.5, fontSize: '1.25rem' }}>
          {headlineScoreT(rankingStrategy)}
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

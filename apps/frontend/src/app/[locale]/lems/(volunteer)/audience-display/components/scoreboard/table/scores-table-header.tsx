import { TableCell, TableHead, TableRow, alpha } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMatchTranslations } from '@lems/localization';
import type { ScoreboardRound } from '../hooks/use-scoreboard-rounds';

interface ScoresTableHeaderProps {
  rounds: ScoreboardRound[];
}

export const ScoresTableHeader = ({ rounds }: ScoresTableHeaderProps) => {
  const t = useTranslations('pages.audience-display.scoreboard.scores-table');
  const { getStage } = useMatchTranslations();

  return (
    <TableHead sx={{ bgcolor: theme => alpha(theme.palette.primary.main, 0.08) }}>
      <TableRow sx={{ bgcolor: theme => alpha(theme.palette.primary.main, 0.08) }}>
        <TableCell align="center" sx={{ fontWeight: 700, py: 1.5, fontSize: '0.95rem' }}>
          {t('rank')}
        </TableCell>
        <TableCell sx={{ fontWeight: 700, py: 1.5, fontSize: '0.95rem' }} width="35%">
          {t('team')}
        </TableCell>
        {rounds.map(round => (
          <TableCell
            key={`round-${round.stage}-${round.round}`}
            align="center"
            sx={{ fontWeight: 700, py: 1.5, fontSize: '0.95rem' }}
          >
            {`${getStage(round.stage)} #${round.round}`}
          </TableCell>
        ))}
        <TableCell align="center" sx={{ fontWeight: 700, py: 1.5, fontSize: '0.95rem' }}>
          {t('highest-score')}
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

import { Avatar, Box, TableCell, TableRow, Typography, alpha } from '@mui/material';
import type { TeamScoreData } from '../hooks/use-team-scores';
import { ScoreCell } from './score-cell';

interface ScoresTableRowProps {
  team: TeamScoreData;
  index: number;
}

export const ScoresTableRow = ({ team, index }: ScoresTableRowProps) => {
  return (
    <TableRow
      sx={{
        bgcolor:
          index % 2 === 0 ? 'background.paper' : theme => alpha(theme.palette.primary.main, 0.02),
        '&:hover': {
          bgcolor: theme => alpha(theme.palette.primary.main, 0.05)
        },
        transition: 'background-color 0.2s'
      }}
    >
      <TableCell align="center" sx={{ fontWeight: 600, py: 1.25, fontSize: '1.5rem' }}>
        {team.rank}
      </TableCell>
      <TableCell sx={{ py: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={team.logoUrl ?? '/assets/default-avatar.svg'}
            sx={{
              width: 48,
              height: 48,
              color: 'white',
              objectFit: 'cover',
              flexShrink: 0
            }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
              #{team.number} | {team.name}
            </Typography>
            <Typography sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
              {team.affiliation}, {team.city}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      {team.scores.map((score, scoreIndex) => (
        <TableCell
          key={`score-${team.teamId}-${scoreIndex}`}
          align="center"
          sx={{ py: 1.25, fontSize: '1.25rem', fontWeight: 500 }}
        >
          <ScoreCell score={score} />
        </TableCell>
      ))}
      <TableCell
        align="center"
        sx={{ fontWeight: 700, py: 1.25, color: 'primary.main', fontSize: '1.35rem' }}
      >
        {team.maxScore}
      </TableCell>
    </TableRow>
  );
};

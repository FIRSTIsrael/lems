'use client';

import { useTranslations } from 'next-intl';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import type { ScoreboardTeam } from '../graphql/types';

interface ScoreboardTableProps {
  teams: ScoreboardTeam[];
}

export function ScoreboardTable({ teams }: ScoreboardTableProps) {
  const t = useTranslations('pages.reports.scoreboard');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const matchesPerTeam = Math.max(...teams.map(team => team.scores.length), 0);
  const sortedTeams = [...teams].sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));

  return (
    <Paper sx={{ p: 0, bgcolor: 'white' }}>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table
          size="small"
          sx={{
            tableLayout: 'fixed',
            width: '100%',
            minWidth: Math.max(400, 300 + matchesPerTeam * 80)
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell width={60} align="center">
                <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                  {t('rank')}
                </Typography>
              </TableCell>
              <TableCell width={180}>
                <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                  {t('team')}
                </Typography>
              </TableCell>
              <TableCell width={80} align="center">
                <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                  {t('best-score')}
                </Typography>
              </TableCell>
              {Array.from({ length: matchesPerTeam }, (_, index) => (
                <TableCell key={index} width={80} align="center">
                  <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                    {t('match')} {index + 1}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTeams.map(team => (
              <TableRow key={team.id}>
                <TableCell align="center">
                  <Typography fontWeight={500} fontSize={isMobile ? '0.75rem' : '1rem'}>
                    {team.rank ?? '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography fontSize={isMobile ? '0.75rem' : '1rem'}>
                    #{team.number} {team.name}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    fontWeight={600}
                    fontSize={isMobile ? '0.75rem' : '1rem'}
                    color="primary"
                  >
                    {team.maxScore ?? '-'}
                  </Typography>
                </TableCell>
                {Array.from({ length: matchesPerTeam }, (_, index) => (
                  <TableCell key={index} align="center">
                    <Typography fontSize={isMobile ? '0.75rem' : '1rem'}>
                      {team.scores[index] ?? '-'}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

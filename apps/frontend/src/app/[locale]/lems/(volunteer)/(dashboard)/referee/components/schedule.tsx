'use client';

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box
} from '@mui/material';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { useReferee } from './referee-context';

export function RefereeSchedule() {
  const t = useTranslations('pages.referee');
  const { upcomingMatches } = useReferee();

  if (upcomingMatches.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#999' }}>
          {t('no-upcoming-matches')}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>{t('match')}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{t('scheduled-time')}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{t('teams')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {upcomingMatches.map(match => (
            <TableRow
              key={match.id}
              hover
              sx={{
                '&:last-child td': { border: 0 }
              }}
            >
              <TableCell sx={{ fontWeight: 500 }}>{match.slug}</TableCell>
              <TableCell>{dayjs(match.scheduledTime).format('HH:mm')}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {match.participants.map(p => (
                    <Typography key={p.team?.id || 'empty'} variant="caption">
                      {p.team?.number || '-'}
                    </Typography>
                  ))}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

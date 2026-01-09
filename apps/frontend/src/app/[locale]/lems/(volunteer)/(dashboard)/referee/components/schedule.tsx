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
  Stack
} from '@mui/material';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { useMatchTranslations } from '@lems/localization';
import { TeamInfo } from '../../components/team-info';
import { useReferee } from './referee-context';

export function RefereeSchedule() {
  const t = useTranslations('pages.referee');
  const { getStage } = useMatchTranslations();
  const { upcomingMatches } = useReferee();

  if (upcomingMatches.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {t('no-upcoming-matches')}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead sx={{ backgroundColor: 'grey.100' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: '1rem', py: 2, textAlign: 'center' }}>
              {t('match')}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '1rem', py: 2, textAlign: 'center' }}>
              {t('scheduled-time')}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '1rem', py: 2, textAlign: 'center' }}>
              {t('teams')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {upcomingMatches.map(match => (
            <TableRow
              key={match.id}
              hover
              sx={{
                '&:last-child td': { border: 0 },
                '& td': { py: 2 }
              }}
            >
              <TableCell sx={{ textAlign: 'center' }}>
                <Stack spacing={0.25} alignItems="center">
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {getStage(match.stage)} #{match.number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('round')} {match.round}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {dayjs(match.scheduledTime).format('HH:mm')}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <Stack spacing={1.5} alignItems="center">
                  {match.participants.map(p =>
                    p.team ? (
                      <TeamInfo key={p.team.id} team={p.team} size="sm" />
                    ) : (
                      <Typography key="empty" variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

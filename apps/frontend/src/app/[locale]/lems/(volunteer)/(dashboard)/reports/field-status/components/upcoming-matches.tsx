'use client';

import { useTranslations } from 'next-intl';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import { useTime } from '../../../../../../../../lib/time/hooks';

interface Participant {
  team?: {
    id: string;
    number: number;
    name: string;
  } | null;
  table: {
    id: string;
    name: string;
  };
}

interface Match {
  id: string;
  slug: string;
  number: number;
  scheduledTime: string;
  status: string;
  participants: Participant[];
}

interface UpcomingMatchesProps {
  matches: Match[];
  maxDisplay?: number;
}

/**
 * Display upcoming matches in table format
 * Shows next 3 rounds with participants by table
 */
export function UpcomingMatches({ matches, maxDisplay = 3 }: UpcomingMatchesProps) {
  const t = useTranslations('pages.reports.field-status');
  const currentTime = useTime({ interval: 30000 });
  const now = currentTime.toDate();
  const upcoming = matches
    .filter(m => m.status === 'not-started' && new Date(m.scheduledTime) > now)
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
    .slice(0, maxDisplay);

  if (upcoming.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {t('upcoming-matches.title')}
        </Typography>
        <Typography color="text.secondary">{t('upcoming-matches.no-matches')}</Typography>
      </Paper>
    );
  }

  const allTables = Array.from(
    new Set(
      upcoming.flatMap(match => match.participants.filter(p => p.team).map(p => p.table.name))
    )
  ).sort();

  return (
    <Paper sx={{ p: 0 }}>
      <Stack spacing={2} sx={{ p: 3, pb: 0 }}>
        <Typography variant="h6" fontWeight={600}>
          {t('upcoming-matches.title')}
        </Typography>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ fontWeight: 600, color: 'white', minWidth: 120 }}>
                {t('upcoming-matches.time')}
              </TableCell>
              {allTables.map(tableName => (
                <TableCell
                  key={tableName}
                  align="center"
                  sx={{ fontWeight: 600, color: 'white', minWidth: 150 }}
                >
                  {tableName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {upcoming.map((match, index) => {
              const timeUntil = currentTime.to(match.scheduledTime, true);
              const isNext = index === 0;

              return (
                <TableRow
                  key={match.id}
                  sx={{
                    bgcolor: isNext ? 'primary.50' : 'white',
                    '&:hover': { bgcolor: isNext ? 'primary.100' : 'grey.50' }
                  }}
                >
                  <TableCell sx={{ verticalAlign: 'top', py: 2 }}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                          {match.slug}
                        </Typography>
                        {isNext && (
                          <Chip label={t('upcoming-matches.next')} size="small" color="primary" />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {currentTime
                          .set('hour', new Date(match.scheduledTime).getHours())
                          .set('minute', new Date(match.scheduledTime).getMinutes())
                          .format('HH:mm')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('upcoming-matches.in-time', { time: timeUntil })}
                      </Typography>
                    </Stack>
                  </TableCell>
                  {allTables.map(tableName => {
                    const participant = match.participants.find(
                      p => p.table.name === tableName && p.team
                    );

                    return (
                      <TableCell
                        key={tableName}
                        align="center"
                        sx={{ verticalAlign: 'top', py: 2 }}
                      >
                        {participant?.team ? (
                          <Stack spacing={0.5} alignItems="center">
                            <Typography variant="body2" fontWeight={500}>
                              {t('upcoming-matches.team-number', {
                                number: participant.team.number
                              })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {participant.team.name}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

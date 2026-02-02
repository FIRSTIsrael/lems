'use client';

import { useMemo } from 'react';
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
  Box,
  Stack,
  Skeleton
} from '@mui/material';
import dayjs from 'dayjs';
import { useTime } from '../../../../../../../lib/time/hooks/use-time';
import type { FieldQueuerData } from '../graphql';

interface FieldScheduleViewProps {
  data: FieldQueuerData;
  loading?: boolean;
}

export function FieldScheduleView({ data, loading }: FieldScheduleViewProps) {
  const t = useTranslations('pages.field-queuer.field-schedule');
  const currentTime = useTime({ interval: 1000 });

  const tables = useMemo(() => {
    const tableMap = new Map<string, { id: string; name: string }>();
    data.matches.forEach(match => {
      match.participants.forEach(p => {
        if (p.table && !tableMap.has(p.table.id)) {
          tableMap.set(p.table.id, { id: p.table.id, name: p.table.name });
        }
      });
    });
    const result = Array.from(tableMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [data.matches]);

  const upcomingMatches = useMemo(() => {
    return data.matches
      .filter(
        match =>
          match.status === 'not-started' &&
          currentTime.diff(dayjs(match.scheduledTime), 'minute') >= -30
      )
      .slice(0, 10);
  }, [data.matches, currentTime]);

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={400} />
      </Paper>
    );
  }

  if (upcomingMatches.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {t('no-matches')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      <Box sx={{ px: 2, pt: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          {t('title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 'calc(100vh - 200px)',
          overflowX: 'auto'
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 600,
                  minWidth: 60,
                  position: 'sticky',
                  left: 0,
                  bgcolor: 'background.paper',
                  zIndex: 3
                }}
              >
                {t('match')}
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  minWidth: 70
                }}
              >
                {t('time')}
              </TableCell>
              {tables.map(table => (
                <TableCell
                  key={table.id}
                  align="center"
                  sx={{
                    fontWeight: 600,
                    minWidth: 80
                  }}
                >
                  {table.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {upcomingMatches.map(match => {
              const minutesUntil = -currentTime.diff(dayjs(match.scheduledTime), 'minute');
              const isUrgent = minutesUntil <= 5;
              const isPast = minutesUntil < 0;

              return (
                <TableRow
                  key={match.id}
                  sx={{
                    bgcolor: match.called
                      ? 'action.hover'
                      : isUrgent && !isPast
                        ? 'warning.light'
                        : 'inherit'
                  }}
                >
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      bgcolor: match.called
                        ? 'action.hover'
                        : isUrgent && !isPast
                          ? 'warning.light'
                          : 'background.paper',
                      zIndex: 2
                    }}
                  >
                    <Chip
                      label={match.number}
                      size="small"
                      color={match.called ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {dayjs(match.scheduledTime).format('HH:mm')}
                    </Typography>
                  </TableCell>
                  {tables.map(table => {
                    const participant = match.participants.find(p => p.table?.id === table.id);
                    const team = participant?.team;

                    return (
                      <TableCell key={table.id} align="center">
                        {team ? (
                          <Chip
                            label={team.number}
                            size="small"
                            variant={team.arrived ? 'filled' : 'outlined'}
                            color={team.arrived ? 'success' : 'default'}
                            sx={{ fontWeight: 600, minWidth: 50 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
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
    </Stack>
  );
}

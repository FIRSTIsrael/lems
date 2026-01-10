'use client';

import { useTranslations } from 'next-intl';
import { Paper, Stack, Typography, Box, Chip } from '@mui/material';
import dayjs from 'dayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTime } from '../../../../../../../../lib/time/hooks';

interface Participant {
  id: string;
  team?: {
    id: string;
    number: number;
    name: string;
  } | null;
  table: {
    id: string;
    name: string;
  };
  queued: boolean;
  present: boolean;
}

interface Match {
  id: string;
  slug: string;
  number: number;
  scheduledTime: string;
  called: boolean;
  status: string;
  participants: Participant[];
}

interface QueueOverviewProps {
  matches: Match[];
}

/**
 * Overview of matches in queue
 * Shows called matches and team readiness
 * NO QUEUE YET
 */
export function QueueOverview({ matches }: QueueOverviewProps) {
  const t = useTranslations('pages.reports.field-status.queue-overview');
  const currentTime = useTime({ interval: 1000 });
  const queuedMatches = matches.filter(m => m.called && m.status === 'not-started');

  if (queuedMatches.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontSize: '1.25rem' }}>
          📋 {t('title')}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 700 }}>
          {t('no-matches')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={700} sx={{ fontSize: '1.25rem' }}>
            📋 {t('title')}
          </Typography>
          <Chip label={`${queuedMatches.length} ${t('match-label')}`} color="primary" />
        </Stack>

        <Stack spacing={2}>
          {queuedMatches.map(match => {
            const participants = match.participants.filter(p => p.team);
            const queuedCount = participants.filter(p => p.queued).length;
            const totalCount = participants.length;
            const scheduledTime = currentTime
              .set('hour', dayjs(match.scheduledTime).hour())
              .set('minute', dayjs(match.scheduledTime).minute())
              .set('second', 0);

            return (
              <Box
                key={match.id}
                sx={{
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Stack spacing={0.5}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1.05rem' }}>
                      {t('match-label')} {match.slug}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: '1rem', fontWeight: 700 }}
                    >
                      {scheduledTime.format('HH:mm')}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: '1rem', fontWeight: 700 }}
                    >
                      {t('in-queue')}
                    </Typography>
                    <Chip
                      label={`${queuedCount}/${totalCount}`}
                      size="small"
                      color={queuedCount === totalCount ? 'success' : 'default'}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                    {participants.map(p => (
                      <Chip
                        key={p.id}
                        label={`${p.table.name}: ${t('team-label')} ${p.team?.number}`}
                        size="small"
                        variant={p.queued ? 'filled' : 'outlined'}
                        icon={p.queued ? <CheckCircleIcon /> : <AccessTimeIcon />}
                        color={p.queued ? 'success' : 'default'}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}

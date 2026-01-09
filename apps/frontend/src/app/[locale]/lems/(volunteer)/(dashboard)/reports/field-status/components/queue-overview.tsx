'use client';

import { Paper, Stack, Typography, Box, Chip } from '@mui/material';
import dayjs from 'dayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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
  sessions?: any[];
}

/**
 * Overview of matches in queue
 * Shows called matches and team readiness
 */
export function QueueOverview({ matches, sessions = [] }: QueueOverviewProps) {
  const queuedMatches = matches.filter(m => m.called && m.status === 'not-started');

  if (queuedMatches.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          📋 מצב הקיו
        </Typography>
        <Typography color="text.secondary">אין מקצים בקיו כרגע</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={600}>
            📋 מצב הקיו
          </Typography>
          <Chip label={`${queuedMatches.length} מקצים`} color="primary" />
        </Stack>

        <Stack spacing={2}>
          {queuedMatches.map(match => {
            const participants = match.participants.filter(p => p.team);
            const queuedCount = participants.filter(p => p.queued).length;
            const totalCount = participants.length;

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
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      מקצה {match.slug}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dayjs(match.scheduledTime).format('HH:mm')}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      בקיו:
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
                        label={`${p.table.name}: קבוצה ${p.team?.number}`}
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

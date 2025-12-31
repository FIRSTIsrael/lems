'use client';

import { Paper, Stack, Typography, Box, Chip } from '@mui/material';
import dayjs from 'dayjs';
import ScheduleIcon from '@mui/icons-material/Schedule';

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
 * Display upcoming matches in timeline format
 * Shows next several matches with participants
 */
export function UpcomingMatches({ matches, maxDisplay = 10 }: UpcomingMatchesProps) {
  const now = new Date();
  const upcoming = matches
    .filter(m => m.status === 'not-started' && new Date(m.scheduledTime) > now)
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
    .slice(0, maxDisplay);

  if (upcoming.length === 0) {
    return (
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          📅 מקצים קרובים
        </Typography>
        <Typography color="text.secondary">אין מקצים קרובים</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={600}>
          📅 מקצים קרובים
        </Typography>

        <Stack spacing={2}>
          {upcoming.map((match, index) => {
            const participants = match.participants.filter(p => p.team);
            const timeUntil = dayjs(match.scheduledTime).diff(dayjs(), 'minutes');

            return (
              <Box
                key={match.id}
                sx={{
                  p: 2,
                  bgcolor: index === 0 ? 'action.hover' : 'background.default',
                  borderRadius: 2,
                  border: index === 0 ? '2px solid' : '1px solid',
                  borderColor: index === 0 ? 'primary.main' : 'divider'
                }}
              >
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight={600}>
                        מקצה {match.slug}
                      </Typography>
                      {index === 0 && <Chip label="הבא" size="small" color="primary" />}
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(match.scheduledTime).format('HH:mm')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (בעוד {timeUntil} דקות)
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {participants.map(p => (
                      <Chip
                        key={p.team?.id}
                        label={`${p.table.name}: קבוצה ${p.team?.number}`}
                        size="small"
                        variant="outlined"
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

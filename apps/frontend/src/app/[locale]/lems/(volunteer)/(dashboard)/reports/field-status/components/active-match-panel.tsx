'use client';

import { Paper, Stack, Typography, Chip, Box } from '@mui/material';
import dayjs from 'dayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';

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
  ready: boolean;
}

interface Match {
  id: string;
  slug: string;
  stage: string;
  round: number;
  number: number;
  scheduledTime: string;
  status: string;
  startTime?: string | null;
  startDelta?: number | null;
  participants: Participant[];
}

interface ActiveMatchPanelProps {
  match: Match | null;
  matchLength?: number;
}

/**
 * Display panel for currently active match
 * Shows match info, participants, and progress
 */
export function ActiveMatchPanel({ match, matchLength = 150 }: ActiveMatchPanelProps) {
  if (!match) {
    return (
      <Paper sx={{ p: 3, flex: 1 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={600}>
            🏆 מקצה רץ
          </Typography>
          <Typography color="text.secondary">אין מקצה פעיל כרגע</Typography>
        </Stack>
      </Paper>
    );
  }

  const getStatusColor = () => {
    if (match.status === 'in-progress') return 'success';
    if (match.status === 'completed') return 'primary';
    return 'default';
  };

  const getStatusText = () => {
    if (match.status === 'in-progress') return 'רץ';
    if (match.status === 'completed') return 'הושלם';
    return match.status;
  };

  const formatDelay = (delta: number) => {
    const minutes = Math.floor(Math.abs(delta) / 60);
    const seconds = Math.abs(delta) % 60;
    const sign = delta > 0 ? '+' : '-';
    return `${sign}${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <Paper sx={{ p: 3, flex: 1 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Typography variant="h5" fontWeight={600}>
            🏆 מקצה {match.slug}
          </Typography>
          <Chip
            label={getStatusText()}
            color={getStatusColor()}
            icon={match.status === 'in-progress' ? <PlayCircleFilledIcon /> : <CheckCircleIcon />}
          />
        </Stack>

        {match.startTime && (
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              התחיל: {dayjs(match.startTime).format('HH:mm:ss')}
            </Typography>
            {match.startDelta !== null && match.startDelta !== undefined && (
              <Typography
                variant="body2"
                color={Math.abs(match.startDelta) > 120 ? 'error' : 'text.secondary'}
              >
                סטייה: {formatDelay(match.startDelta)}
              </Typography>
            )}
          </Stack>
        )}

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            משתתפים:
          </Typography>
          <Stack spacing={1}>
            {match.participants
              .filter(p => p.team)
              .map(participant => (
                <Stack
                  key={participant.id}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    py: 1,
                    px: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2" fontWeight={500} sx={{ minWidth: 80 }}>
                    {participant.table.name}:
                  </Typography>
                  <Typography variant="body2">
                    קבוצה {participant.team?.number} - {participant.team?.name}
                  </Typography>
                  {participant.ready && <CheckCircleIcon fontSize="small" color="success" />}
                </Stack>
              ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

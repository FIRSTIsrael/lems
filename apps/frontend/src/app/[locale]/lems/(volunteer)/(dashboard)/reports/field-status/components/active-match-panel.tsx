'use client';

import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Paper, Stack, Typography, Chip, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { useMatchTranslations } from '@lems/localization';

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
export function ActiveMatchPanel({ match }: ActiveMatchPanelProps) {
  const t = useTranslations('pages.reports.field-status');
  const { getStage } = useMatchTranslations();

  if (!match) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack spacing={2} sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            {t('active-match.title')}
          </Typography>
          <Typography color="text.secondary">{t('active-match.no-match')}</Typography>
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
    if (match.status === 'in-progress') return t('active-match.status.in-progress');
    if (match.status === 'completed') return t('active-match.status.completed');
    return match.status;
  };

  const formatDelay = (delta: number) => {
    const minutes = Math.floor(Math.abs(delta) / 60);
    const seconds = Math.abs(delta) % 60;
    const sign = delta > 0 ? '+' : '-';
    return `${sign}${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Typography variant="h5" fontWeight={700} sx={{ fontSize: '1.35rem' }}>
            {getStage(match.stage)} #{match.number}
          </Typography>
          <Chip
            label={getStatusText()}
            color={getStatusColor()}
            icon={match.status === 'in-progress' ? <PlayCircleFilledIcon /> : <CheckCircleIcon />}
          />
        </Stack>

        {match.startTime && (
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '1.05rem', fontWeight: 700 }}
            >
              {t('active-match.started-at')}: {dayjs(match.startTime).format('HH:mm:ss')}
            </Typography>
            {match.scheduledTime && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '1.05rem', fontWeight: 700 }}
              >
                {t('active-match.scheduled-at')}: {dayjs(match.scheduledTime).format('HH:mm:ss')}
              </Typography>
            )}
            {match.startDelta !== null && match.startDelta !== undefined && (
              <Typography
                variant="body2"
                color={Math.abs(match.startDelta) > 120 ? 'error' : 'text.secondary'}
                sx={{ fontSize: '1.05rem', fontWeight: 700 }}
              >
                {t('active-match.deviation')}: {formatDelay(match.startDelta)}
              </Typography>
            )}
          </Stack>
        )}

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            sx={{
              fontSize: '0.95rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}
          >
            {t('active-match.participants')}:
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 1
            }}
          >
            {match.participants
              .filter(p => p.team)
              .map(participant => (
                <Stack
                  key={participant.id}
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  sx={{
                    py: 1,
                    px: 2,
                    borderRadius: 1,
                    border: '2px solid',
                    borderColor: participant.ready ? 'success.main' : 'grey.400'
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ minWidth: 80, fontSize: '1.05rem' }}
                  >
                    {participant.table.name}:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ flex: 1, fontSize: '1.05rem', fontWeight: 700 }}
                  >
                    {t('active-match.team-label')} {participant.team?.number} -{' '}
                    {participant.team?.name}
                  </Typography>
                  {participant.ready && <CheckCircleIcon fontSize="small" color="success" />}
                </Stack>
              ))}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}

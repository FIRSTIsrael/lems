'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Paper, Typography, Stack, Box, Chip } from '@mui/material';
import { PlayArrow, Schedule, Gavel } from '@mui/icons-material';
import { useMatchTranslations } from '@lems/localization';
import { CurrentActivity } from '@lems/types/api/portal';
import { useRealtimeData } from '../../../hooks/use-realtime-data';
import { useDivision } from './division-data-context';

export const CurrentActivityDisplay = () => {
  const t = useTranslations('pages.event');
  const { getStage } = useMatchTranslations();
  const division = useDivision();
  const params = useParams();
  const eventSlug = params.slug as string;

  const { data } = useRealtimeData<CurrentActivity>(
    `/portal/divisions/${division.id}/current-activity`,
    { suspense: true }
  );

  if (!data) {
    return null;
  }

  const { activeMatch, loadedMatch, currentSessions } = data;

  // Don't show anything if there's no current activity
  if (!activeMatch && !loadedMatch && currentSessions.length === 0) {
    return null;
  }

  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        border: '1px solid',
        borderColor: 'primary.main',
        bgcolor: 'primary.50'
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <PlayArrow color="primary" />
        <Typography variant="h6" fontWeight="bold" color="primary.main">
          {t('current-activity.title')}
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        {/* Active Match */}
        {activeMatch && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'error.main'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                {t('current-activity.active-match')}
              </Typography>
              <Chip
                label={t('current-activity.live')}
                size="small"
                color="error"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {getStage(activeMatch.stage)} {t('current-activity.round')} {activeMatch.round},{' '}
              {t('current-activity.match')} #{activeMatch.number}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {activeMatch.participants.map((participant, idx) => (
                <Box key={idx}>
                  {participant.team ? (
                    <Link
                      href={`/event/${eventSlug}/team/${participant.team.slug}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <Typography
                        variant="body2"
                        color="primary.main"
                        sx={{ '&:hover': { textDecoration: 'underline' } }}
                      >
                        {participant.table.name}: #{participant.team.number} {participant.team.name}
                      </Typography>
                    </Link>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      {participant.table.name}: {t('current-activity.no-team')}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Loaded Match (Next Up) */}
        {loadedMatch && !activeMatch && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'grey.300'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Schedule fontSize="small" color="action" />
              <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                {t('current-activity.next-match')}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {getStage(loadedMatch.stage)} {t('current-activity.round')} {loadedMatch.round},{' '}
              {t('current-activity.match')} #{loadedMatch.number}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mb: 0.5, display: 'block' }}>
              {t('current-activity.scheduled-at')}:{' '}
              {dayjs(loadedMatch.scheduledTime).format('HH:mm')}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {loadedMatch.participants.map((participant, idx) => (
                <Box key={idx}>
                  {participant.team ? (
                    <Link
                      href={`/event/${eventSlug}/team/${participant.team.slug}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <Typography
                        variant="body2"
                        color="primary.main"
                        sx={{ '&:hover': { textDecoration: 'underline' } }}
                      >
                        {participant.table.name}: #{participant.team.number} {participant.team.name}
                      </Typography>
                    </Link>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      {participant.table.name}: {t('current-activity.no-team')}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Current Judging Sessions */}
        {currentSessions.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'grey.300'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Gavel fontSize="small" color="action" />
              <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                {t('current-activity.judging-sessions')} ({currentSessions.length})
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              {currentSessions.map(session => (
                <Box key={session.id}>
                  {session.team ? (
                    <Link
                      href={`/event/${eventSlug}/team/${session.team.slug}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <Typography
                        variant="body2"
                        color="primary.main"
                        sx={{ '&:hover': { textDecoration: 'underline' } }}
                      >
                        {session.room.name}: #{session.team.number} {session.team.name}
                      </Typography>
                    </Link>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      {session.room.name}: {t('current-activity.no-team')}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

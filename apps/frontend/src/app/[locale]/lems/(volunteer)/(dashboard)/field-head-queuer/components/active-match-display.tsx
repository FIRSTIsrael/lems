'use client';

import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Paper, Stack, Typography, Chip, Box, Skeleton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { type RobotGameMatch } from '../graphql';

interface ActiveMatchDisplayProps {
  activeMatch: RobotGameMatch | null;
  loadedMatch: RobotGameMatch | null;
  loading?: boolean;
}

export function ActiveMatchDisplay({ activeMatch, loadedMatch, loading }: ActiveMatchDisplayProps) {
  const t = useTranslations('pages.field-head-queuer.active-match');

  if (loading) {
    return (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Skeleton variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 1 }} />
      </Stack>
    );
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Paper
        sx={{
          flex: 1,
          p: 3,
          bgcolor: activeMatch ? 'success.main' : 'action.disabledBackground',
          color: activeMatch ? 'success.contrastText' : 'text.secondary'
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PlayArrowIcon />
            <Typography variant="h6" fontWeight={600}>
              {t('running-match')}
            </Typography>
          </Stack>
          {activeMatch ? (
            <>
              <Box>
                <Chip
                  label={`${t('match')} ${activeMatch.number}`}
                  size="medium"
                  sx={{
                    bgcolor: 'success.dark',
                    color: 'success.contrastText',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}
                />
              </Box>
              {activeMatch.startTime && (
                <Typography variant="body2">
                  {t('started-at', {
                    time: dayjs(activeMatch.startTime).format('HH:mm:ss')
                  })}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body2">{t('no-active-match')}</Typography>
          )}
        </Stack>
      </Paper>

      <Paper
        sx={{
          flex: 1,
          p: 3,
          bgcolor: loadedMatch ? 'primary.main' : 'action.disabledBackground',
          color: loadedMatch ? 'primary.contrastText' : 'text.secondary'
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ScheduleIcon />
            <Typography variant="h6" fontWeight={600}>
              {t('next-match')}
            </Typography>
          </Stack>
          {loadedMatch ? (
            <>
              <Box>
                <Chip
                  label={`${t('match')} ${loadedMatch.number}`}
                  size="medium"
                  sx={{
                    bgcolor: 'primary.dark',
                    color: 'primary.contrastText',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}
                />
              </Box>
              <Typography variant="body2">
                {t('scheduled-at', {
                  time: dayjs(loadedMatch.scheduledTime).format('HH:mm')
                })}
              </Typography>
            </>
          ) : (
            <Typography variant="body2">{t('no-loaded-match')}</Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

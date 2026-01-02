'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Box, Typography, Button, alpha, useTheme, LinearProgress, Stack } from '@mui/material';
import { PlayArrow, Lock } from '@mui/icons-material';
import { useTime } from '../../../../../../../lib/time/hooks';
import { Countdown } from '../../../../../../../lib/time/countdown';
import { useCategoryDeliberation } from '../deliberation-context';

const DELIBERATION_DURATION_SECONDS = 45 * 60; // 45 minutes

const getProgressColor = (progressPercent: number) => {
  if (progressPercent >= 20) return 'primary';
  return 'warning';
};

export function ControlsPanel() {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.category.controls');
  const { deliberation, startDeliberation } = useCategoryDeliberation();
  const currentTime = useTime({ interval: 1000 });

  const handleStartDeliberation = useCallback(async () => {
    await startDeliberation();
  }, [startDeliberation]);

  const isInProgress = useMemo(() => deliberation?.status === 'in-progress', [deliberation]);

  // Calculate timer values
  const timerValues = useMemo(() => {
    if (!isInProgress || !deliberation?.startTime) {
      return {
        endTime: null,
        elapsedSeconds: 0,
        progressPercent: 0,
        timeRemaining: DELIBERATION_DURATION_SECONDS
      };
    }

    const startTime = dayjs(deliberation.startTime);
    const endTime = startTime.add(DELIBERATION_DURATION_SECONDS, 'second');
    const elapsedSeconds = currentTime.diff(startTime, 'second');
    const timeRemaining = Math.max(0, DELIBERATION_DURATION_SECONDS - elapsedSeconds);
    const progressPercent = Math.max(
      0,
      100 - (elapsedSeconds / DELIBERATION_DURATION_SECONDS) * 100
    );

    return {
      endTime: endTime.toDate(),
      elapsedSeconds,
      progressPercent,
      timeRemaining
    };
  }, [isInProgress, deliberation, currentTime]);

  return (
    <Box
      sx={{
        p: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderRadius: 1.5,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {isInProgress ? (
        <Stack spacing={1.25} sx={{ flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: 'text.secondary',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: 0.5
              }}
            >
              {t('time-remaining')}
            </Typography>
            <Countdown
              variant="subtitle2"
              targetDate={timerValues.endTime || new Date()}
              fontFamily="monospace"
              fontWeight={700}
              fontSize="1.1rem"
              sx={{
                color:
                  timerValues.progressPercent >= 20
                    ? theme.palette.primary.main
                    : theme.palette.warning.main
              }}
            />
          </Stack>

          <LinearProgress
            variant="determinate"
            value={Math.min(timerValues.progressPercent, 100)}
            color={getProgressColor(timerValues.progressPercent)}
            sx={{
              height: 8,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.divider, 0.5),
              transition: 'all 0.3s ease',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                transition: 'background-color 0.3s ease'
              }
            }}
          />
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {t('not-started')}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        {!isInProgress ? (
          <Button
            variant="contained"
            fullWidth
            startIcon={<PlayArrow />}
            onClick={handleStartDeliberation}
            size="small"
            sx={{
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            {t('start')}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            fullWidth
            startIcon={<Lock />}
            size="small"
            sx={{
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            {t('lock')}
          </Button>
        )}
      </Box>
    </Box>
  );
}

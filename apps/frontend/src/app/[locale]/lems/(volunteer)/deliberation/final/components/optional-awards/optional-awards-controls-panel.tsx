'use client';

import { PlayArrow, Verified } from '@mui/icons-material';
import { Box, Button, LinearProgress, Stack, Typography, alpha, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { OPTIONAL_AWARDS, Award, PERSONAL_AWARDS } from '@lems/shared';
import { Countdown } from '../../../../../../../../lib/time/countdown';
import { useTime } from '../../../../../../../../lib/time/hooks';
import { useFinalDeliberation } from '../../final-deliberation-context';
import { ManualEligibilityControl } from '../shared/manual-eligibility-control';

const DELIBERATION_DURATION_SECONDS = 10 * 60; // 10 minutes

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(v => typeof v === 'string');
}

function getAwardArray(awards: Record<string, unknown>, award: Award): string[] {
  const awardDict = awards as Record<string, unknown>;
  const value = awardDict[award];
  return isStringArray(value) ? value : [];
}

const getProgressColor = (progressPercent: number) => {
  if (progressPercent >= 20) return 'primary';
  return 'warning';
};

export const OptionalAwardsControlsPanel: React.FC = () => {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.final.optional-awards');
  const { deliberation, startDeliberation, awards, awardCounts, advanceStage } =
    useFinalDeliberation();
  const currentTime = useTime({ interval: 1000 });
  const [isLoading, setIsLoading] = useState(false);

  const handleStartDeliberation = useCallback(async () => {
    setIsLoading(true);
    try {
      await startDeliberation();
    } finally {
      setIsLoading(false);
    }
  }, [startDeliberation]);

  const handleAdvanceStage = useCallback(async () => {
    setIsLoading(true);
    try {
      await advanceStage();
    } finally {
      setIsLoading(false);
    }
  }, [advanceStage]);

  const isInProgress = useMemo(() => deliberation?.status === 'in-progress', [deliberation]);
  const isCompleted = useMemo(() => deliberation?.status === 'completed', [deliberation]);
  const isNotStarted = useMemo(() => !isInProgress && !isCompleted, [isInProgress, isCompleted]);

  // Check if all optional awards are filled (or have their max limit)
  const isOptionalAwardsComplete = useMemo(
    () =>
      deliberation
        ? OPTIONAL_AWARDS.filter(
            award =>
              award !== 'excellence-in-engineering' &&
              !(PERSONAL_AWARDS as readonly string[]).includes(award)
          ).every(award => {
            const selectedCount = getAwardArray(awards, award as Award).length;
            const maxCount = awardCounts[award as Award] ?? 0;
            return selectedCount === maxCount;
          })
        : false,
    [deliberation, awards, awardCounts]
  );

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
        p: 2.5,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderRadius: 1.5,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minHeight: 0
      }}
    >
      {isCompleted && (
        <Box
          sx={{
            p: 1.5,
            bgcolor: 'success.50',
            border: `1px solid ${theme.palette.success.main}`,
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'success.main',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: 0.5
            }}
          >
            {t('completed')}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {t('deliberation-finalized')}
          </Typography>
        </Box>
      )}

      {isInProgress && (
        <Stack spacing={1.25}>
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
      )}

      {isNotStarted && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {t('not-started')}
          </Typography>
        </Box>
      )}

      <ManualEligibilityControl stage="optional-awards" />

      <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
        {isNotStarted ? (
          <Button
            variant="contained"
            fullWidth
            startIcon={<PlayArrow />}
            onClick={handleStartDeliberation}
            disabled={isLoading}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              py: 1.25
            }}
          >
            {t('start')}
          </Button>
        ) : isInProgress ? (
          <Button
            variant="contained"
            fullWidth
            endIcon={<Verified />}
            onClick={handleAdvanceStage}
            disabled={!isOptionalAwardsComplete || isLoading}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              py: 1.25
            }}
          >
            {isLoading ? `${t('saving')}...` : t('advance')}
          </Button>
        ) : null}
      </Box>
    </Box>
  );
};

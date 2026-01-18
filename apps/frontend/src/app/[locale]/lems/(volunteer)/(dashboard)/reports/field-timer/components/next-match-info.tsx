'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { Schedule as ScheduleIcon, Timer as TimerIcon } from '@mui/icons-material';
import { useMatchTranslations } from '@lems/localization';
import { useFieldTimer } from './field-timer-context';

export function NextMatchInfo() {
  const t = useTranslations('pages.reports.field-timer');
  const { getStage } = useMatchTranslations();
  const { nextMatch, currentTime } = useFieldTimer();

  const getMatchLabel = () => {
    if (!nextMatch) return '';
    if (nextMatch.stage === 'TEST') {
      return t('test-match');
    }

    const stageName = getStage(nextMatch.stage);
    return t('match-info', {
      stage: stageName,
      round: nextMatch.round,
      number: nextMatch.number
    });
  };

  const scheduledTime = useMemo(() => {
    if (!nextMatch) return null;
    return dayjs(nextMatch.scheduledTime).toDate();
  }, [nextMatch]);

  const timeUntilStart = useMemo(() => {
    if (!scheduledTime) {
      return { minutes: 0, seconds: 0 };
    }
    const diff = dayjs(scheduledTime).diff(currentTime, 'milliseconds');
    if (diff <= 0) {
      return { minutes: 0, seconds: 0 };
    }
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { minutes, seconds };
  }, [scheduledTime, currentTime]);

  const formattedScheduledTime = useMemo(() => {
    if (!scheduledTime) return '';
    return dayjs(scheduledTime).format('HH:mm');
  }, [scheduledTime]);

  if (!nextMatch) {
    return null;
  }

  const isDesktop = true; // You can adjust this based on context if needed

  return (
    <Box
      sx={{
        textAlign: 'center',
        width: '100%',
        maxWidth: isDesktop ? '600px' : '100%'
      }}
    >
      <Typography
        variant={isDesktop ? 'h5' : 'body1'}
        sx={{
          color: theme => theme.palette.text.secondary,
          mb: 2,
          fontWeight: 500
        }}
      >
        {t('next-match')}
      </Typography>

      <Stack
        spacing={2}
        sx={{
          backgroundColor: theme => theme.palette.background.paper,
          borderRadius: 2,
          border: theme => `1px solid ${theme.palette.divider}`,
          p: isDesktop ? 3 : 2
        }}
      >
        <Typography
          variant={isDesktop ? 'h6' : 'body2'}
          sx={{
            color: theme => theme.palette.text.primary,
            fontWeight: 600
          }}
        >
          {getMatchLabel()}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ flexWrap: 'wrap' }}>
          <Chip
            icon={<ScheduleIcon />}
            label={formattedScheduledTime}
            variant="outlined"
            size={isDesktop ? 'medium' : 'small'}
            sx={{
              borderColor: theme => theme.palette.primary.main,
              color: theme => theme.palette.primary.main,
              '& .MuiChip-icon': {
                color: theme => theme.palette.primary.main
              }
            }}
          />
          <Chip
            icon={<TimerIcon />}
            label={
              timeUntilStart.minutes > 0
                ? `${timeUntilStart.minutes}:${String(timeUntilStart.seconds).padStart(2, '0')}`
                : `${timeUntilStart.seconds}s`
            }
            variant="filled"
            size={isDesktop ? 'medium' : 'small'}
            sx={{
              backgroundColor: theme => theme.palette.primary.light,
              color: theme => theme.palette.primary.dark,
              fontWeight: 600
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );
}

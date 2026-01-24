'use client';

import { useMemo } from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, alpha, Stack } from '@mui/material';
import Image from 'next/image';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { useMatchTranslations } from '@lems/localization';
import { useTime } from '../../../../../../../lib/time/hooks';
import { Countdown } from '../../../../../../../lib/time/countdown';
import { useScoreboard } from './scoreboard-context';

export const ActiveMatch = () => {
  const { getStage } = useMatchTranslations();
  const { activeMatch: activeMatchId, matches, matchLength } = useScoreboard();
  const t = useTranslations('pages.audience-display.scoreboard');

  const currentTime = useTime({ interval: 1000 });

  const activeMatch = useMemo(() => {
    return matches.find(match => match.id === activeMatchId) || null;
  }, [matches, activeMatchId]);

  const matchEnd = useMemo(() => {
    if (!activeMatch?.startTime) return null;
    return dayjs(activeMatch.startTime).add(matchLength, 'seconds');
  }, [activeMatch, matchLength]);

  const timeRemaining = useMemo(() => {
    if (!matchEnd) return 0;
    const remaining = matchEnd.diff(dayjs(currentTime), 'second');
    return Math.max(0, remaining);
  }, [matchEnd, currentTime]);

  const percentLeft = useMemo(
    () => (timeRemaining / matchLength) * 100,
    [timeRemaining, matchLength]
  );

  return (
    <Grid container spacing={1.5} alignItems="center">
      <Grid size={2} display="flex" justifyContent="center">
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '80px'
          }}
        >
          <Image
            src="/assets/audience-display/first-horizontal.svg"
            alt="FIRST Logo"
            fill
            style={{ objectFit: 'contain' }}
          />
        </Box>
      </Grid>

      <Grid size={8}>
        <Stack
          component={Paper}
          p={1.5}
          borderRadius={2}
          sx={{ bgcolor: theme => alpha(theme.palette.background.paper, 0.98) }}
          spacing={2}
          alignItems="flex-start"
          direction="row"
        >
          <Box width="fit-content">
            <Typography
              variant="overline"
              sx={{
                fontSize: { xs: '0.7rem', md: '0.8rem', lg: '0.85rem' },
                fontWeight: 600,
                color: 'text.secondary'
              }}
            >
              {t('current-match')}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem', lg: '2.5rem' },
                whiteSpace: 'nowrap',
                fontWeight: 700,
                color: 'primary.main',
                lineHeight: 1.2
              }}
            >
              {activeMatch?.number
                ? `${getStage(activeMatch.stage)} #${activeMatch.number}`
                : activeMatch?.stage === 'TEST'
                  ? t('test-match')
                  : t('no-match')}
            </Typography>
          </Box>
          {activeMatch && (
            <Stack alignItems="flex-end" spacing={0.5} width="100%">
              <Countdown
                targetDate={matchEnd!.toDate()}
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem', lg: '2.5rem' },
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: percentLeft <= 20 ? 'error.main' : 'primary.main',
                  transition: 'color 0.3s ease',
                  lineHeight: 1.2
                }}
              />
              <LinearProgress
                variant="determinate"
                value={percentLeft}
                sx={{
                  width: '100%',
                  height: 10,
                  borderRadius: 1,
                  backgroundColor: alpha('#ccc', 0.3),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: percentLeft <= 20 ? 'error.main' : 'primary.main',
                    borderRadius: 1,
                    transition: 'background-color 0.3s ease'
                  }
                }}
              />
            </Stack>
          )}
        </Stack>
      </Grid>

      <Grid size={2} display="flex" justifyContent="center">
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '80px'
          }}
        >
          <Image
            src="/assets/audience-display/sponsors/lego-education.svg"
            alt="Lego Education"
            fill
            style={{ objectFit: 'contain' }}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

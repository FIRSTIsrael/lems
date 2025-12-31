'use client';

import { Box, Paper, Typography, LinearProgress, Stack, Divider } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMatchTranslations } from '@lems/localization';
import { useMemo } from 'react';
import { Countdown } from '../../../../../../../lib/time/countdown';
import { useTime } from '../../../../../../../lib/time/hooks';
import { TeamInfo } from '../../components/team-info';
import { useReferee } from './referee-context';

export const RefereeMatchTimer = () => {
  const t = useTranslations('pages.referee');
  const { getStage } = useMatchTranslations();
  const currentTime = useTime({ interval: 1000 });
  const { activeMatch, matchLength } = useReferee();

  const elapsedSeconds = useMemo(() => {
    if (!activeMatch?.startTime) return 0;
    const startTime = new Date(activeMatch.startTime).getTime();
    return Math.floor((currentTime.valueOf() - startTime) / 1000);
  }, [activeMatch, currentTime]);

  const timeRemaining = Math.max(0, matchLength - elapsedSeconds);
  const progress = (elapsedSeconds / matchLength) * 100;

  const targetDate = useMemo(() => {
    return new Date(currentTime.valueOf() + timeRemaining * 1000);
  }, [timeRemaining, currentTime]);

  const teams = useMemo(
    () => activeMatch?.participants.filter(p => p.team) || [],
    [activeMatch?.participants]
  );

  return (
    <Paper
      elevation={4}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        p: 4,
        borderRadius: 2
      }}
    >
      <Stack spacing={3} alignItems="center">
        <Stack spacing={0.5} alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('match-running')}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
            {getStage(activeMatch?.stage || '')} #{activeMatch?.number}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            {t('round')} {activeMatch?.round}
          </Typography>
        </Stack>

        <Box>
          <Countdown
            targetDate={targetDate}
            variant="h1"
            sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '4rem' }}
          />
        </Box>

        <Box sx={{ width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#fff',
                borderRadius: 6
              }
            }}
          />
        </Box>

        {teams.length > 0 && (
          <>
            <Divider sx={{ width: '100%', borderColor: 'rgba(255,255,255,0.3)' }} />
            <Stack spacing={2} sx={{ width: '100%' }}>
              {teams.map(participant => (
                <Box
                  key={participant.team!.id}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: 2,
                    p: 2,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <TeamInfo team={participant.team!} size="md" textAlign="center" />
                </Box>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
};

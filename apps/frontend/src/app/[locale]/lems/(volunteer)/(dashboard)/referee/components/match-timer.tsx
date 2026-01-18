'use client';

import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Stack,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMatchTranslations } from '@lems/localization';
import { useMemo } from 'react';
import { Countdown } from '../../../../../../../lib/time/countdown';
import { useTime } from '../../../../../../../lib/time/hooks';
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
    () => activeMatch?.participants.filter(p => p.team && p.team.name) || [],
    [activeMatch?.participants]
  );

  if (!activeMatch) {
    // This should never be rendered without an active match
    return null;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: 'background.paper'
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center', backgroundColor: 'primary.main' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
          {getStage(activeMatch.stage)} #{activeMatch.number}: {t('round')} {activeMatch.round}
        </Typography>
      </Box>

      <Box sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Countdown
          targetDate={targetDate}
          variant="h1"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '3.5rem',
            color: 'primary.main',
            mb: 2
          }}
        />

        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'primary.main',
                borderRadius: 4
              }
            }}
          />
        </Box>
      </Box>

      {teams.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 3, backgroundColor: 'background.paper' }}>
            <Stack spacing={2}>
              {teams.map((participant, index) => (
                <Paper
                  key={participant.team?.id || index}
                  elevation={1}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: 'background.default',
                    border: '1px solid',
                    borderColor: participant.present === false ? 'error.light' : 'divider',
                    opacity: participant.present === false ? 0.7 : 1
                  }}
                >
                  {participant.team ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        flexWrap: 'wrap'
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2
                        }}
                      >
                        <Avatar
                          src={participant.team.logoUrl ?? '/assets/default-avatar.svg'}
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: 'primary.main',
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: 700
                          }}
                        >
                          {participant.team.number || '?'}
                        </Avatar>
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {participant.team.name} #{participant.team.number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {participant.team.affiliation}, {participant.team.city}
                          </Typography>
                        </Box>
                      </Box>
                      {!participant.present && (
                        <Chip
                          label={t('absent')}
                          color="error"
                          variant="outlined"
                          size="small"
                          sx={{ ml: 'auto' }}
                        />
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {t('team-not-available')}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Stack>
          </Box>
        </>
      )}
    </Paper>
  );
};

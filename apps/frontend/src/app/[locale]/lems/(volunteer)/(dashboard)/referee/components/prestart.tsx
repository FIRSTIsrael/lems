'use client';

import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import { CheckCircle, Warning, Cancel } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import { useMatchTranslations } from '@lems/localization';
import { useTime } from '../../../../../../../lib/time/hooks';
import { useEvent } from '../../../components/event-context';
import { TeamInfo } from '../../components/team-info';
import { UPDATE_PARTICIPANT_STATUS } from '../graphql';
import { useReferee } from './referee-context';
import { InspectionTimer } from './inspection-timer';

const INSPECTION_DURATION = 1.5 * 60; // 1.5 minutes in seconds

export function RefereePrestart() {
  const t = useTranslations('pages.referee');
  const { getStage } = useMatchTranslations();
  const { currentDivision } = useEvent();
  const { loadedMatch } = useReferee();
  const [updateParticipant] = useMutation(UPDATE_PARTICIPANT_STATUS);
  const currentTime = useTime({ interval: 1000 });

  const [inspectionStartTime, setInspectionStartTime] = useState<number | null>(null);
  const prevAnyPresentRef = useRef<boolean>(false);

  const team = loadedMatch?.participants.find(p => p.team);
  const inspectionTimeRemaining = inspectionStartTime 
    ? Math.max(0, INSPECTION_DURATION - (currentTime.valueOf() - inspectionStartTime) / 1000)
    : undefined;

  useEffect(() => {
    if (!loadedMatch || !team) return;
    const isPresent = team.present;
    if (isPresent === prevAnyPresentRef.current) return;
    prevAnyPresentRef.current = isPresent;
    setTimeout(() => setInspectionStartTime(isPresent ? Date.now() : null), 0);
  }, [team?.present, loadedMatch, team]);

  const handleParticipantStatusChange = useCallback(
    (participantId: string, field: 'present' | 'ready', value: boolean) => {
      if (!loadedMatch) return;
      updateParticipant({
        variables: { divisionId: currentDivision.id, matchId: loadedMatch.id, participantId, [field]: value }
      });
    },
    [loadedMatch, currentDivision.id, updateParticipant]
  );

  if (!loadedMatch) return null;

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: 'background.paper'
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {t('prestart-title')}: {t('round')} {loadedMatch.round}
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            {team && (
              <Paper
                key={team.team!.id}
                elevation={2}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  borderLeft: '5px solid',
                  borderColor: !team.team!.arrived
                    ? 'error.main'
                    : team.ready
                      ? 'success.main'
                      : team.present
                        ? 'primary.main'
                        : 'warning.main',
                  backgroundColor: !team.team!.arrived
                    ? 'error.50'
                    : team.present
                      ? 'success.50'
                      : 'grey.50',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    elevation: 3,
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <Stack spacing={2.5}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <TeamInfo team={team.team!} size="lg" />
                    <Chip
                      icon={
                        !team.team!.arrived ? (
                          <Cancel />
                        ) : team.ready ? (
                          <CheckCircle />
                        ) : team.present ? (
                          <CheckCircle />
                        ) : (
                          <Warning />
                        )
                      }
                      label={
                        !team.team!.arrived
                          ? t('no-show-title')
                          : team.ready
                            ? t('ready-confirmed')
                            : team.present
                              ? t('present')
                              : t('absent')
                      }
                      color={
                        !team.team!.arrived
                          ? 'error'
                          : team.ready
                            ? 'success'
                            : team.present
                              ? 'primary'
                              : 'warning'
                      }
                      sx={{ fontSize: '0.9rem', py: 2.5, px: 1.5, fontWeight: 600 }}
                    />
                  </Box>

                  {!team.team!.arrived ? (
                    <Alert severity="error" sx={{ fontSize: '1rem' }}>
                      {t('no-show-description')}
                    </Alert>
                  ) : (
                    <>
                      <ToggleButtonGroup
                        value={team.present ? 'present' : 'absent'}
                        exclusive
                        disabled={team.ready}
                        onChange={(_, value) => {
                          if (value !== null) {
                            handleParticipantStatusChange(
                              team.id,
                              'present',
                              value === 'present'
                            );
                          }
                        }}
                        fullWidth
                        sx={{
                          '& .MuiToggleButton-root': {
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 500
                          }
                        }}
                      >
                        <ToggleButton value="present">{t('present')}</ToggleButton>
                        <ToggleButton value="absent">{t('absent')}</ToggleButton>
                      </ToggleButtonGroup>

                      <Button
                        variant={team.ready ? 'contained' : 'outlined'}
                        fullWidth
                        size="large"
                        onClick={() => {
                          handleParticipantStatusChange(
                            team.id,
                            'ready',
                            !team.ready
                          );
                        }}
                        sx={{
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600
                        }}
                      >
                        {team.ready ? t('ready-confirmed') : t('mark-ready')}
                      </Button>
                    </>
                  )}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Stack>
      </Paper>

      {inspectionStartTime && !team?.ready && <InspectionTimer timeRemaining={inspectionTimeRemaining} />}
    </>
  );
}

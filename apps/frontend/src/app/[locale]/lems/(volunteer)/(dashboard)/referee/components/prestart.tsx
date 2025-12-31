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

const INSPECTION_DURATION = 5 * 60; // 5 minutes in seconds

export function RefereePrestart() {
  const t = useTranslations('pages.referee');
  const { getStage } = useMatchTranslations();
  const { currentDivision } = useEvent();
  const { loadedMatch } = useReferee();
  const [updateParticipant] = useMutation(UPDATE_PARTICIPANT_STATUS);
  const currentTime = useTime({ interval: 1000 });

  const [inspectionStartTime, setInspectionStartTime] = useState<number | null>(null);
  const prevAnyPresentRef = useRef<boolean>(false);

  const teams = useMemo(
    () => loadedMatch?.participants.filter(p => p.team) || [],
    [loadedMatch?.participants]
  );

  const anyPresent = useMemo(() => teams.some(p => p.present), [teams]);

  const inspectionTimeRemaining = useMemo(() => {
    if (!inspectionStartTime) return undefined;
    const elapsed = (currentTime.valueOf() - inspectionStartTime) / 1000;
    return Math.max(0, INSPECTION_DURATION - elapsed);
  }, [inspectionStartTime, currentTime]);

  useEffect(() => {
    if (!loadedMatch) return;

    if (anyPresent !== prevAnyPresentRef.current) {
      prevAnyPresentRef.current = anyPresent;

      if (anyPresent) {
        setTimeout(() => setInspectionStartTime(Date.now()), 0);
      } else {
        setTimeout(() => setInspectionStartTime(null), 0);
      }
    }
  }, [anyPresent, loadedMatch]);

  const handleParticipantStatusChange = useCallback(
    (participantId: string, field: 'present' | 'ready', value: boolean) => {
      if (!loadedMatch) return;

      updateParticipant({
        variables: {
          divisionId: currentDivision.id,
          matchId: loadedMatch.id,
          participantId,
          [field]: value
        }
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
          p: 4,
          borderRadius: 2,
          borderLeft: '6px solid',
          borderColor: 'primary.main'
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {t('prestart-title')}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {getStage(loadedMatch.stage)} #{loadedMatch.number}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('round')} {loadedMatch.round}
            </Typography>
          </Box>

          <Stack spacing={3}>
            {teams.map(participant => (
              <Paper
                key={participant.team!.id}
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderColor: !participant.team!.arrived
                    ? 'error.main'
                    : participant.ready
                      ? 'success.main'
                      : participant.present
                        ? 'primary.main'
                        : 'warning.main',
                  backgroundColor: !participant.team!.arrived
                    ? 'error.50'
                    : participant.present
                      ? 'success.50'
                      : 'grey.50'
                }}
              >
                <Stack spacing={3}>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <TeamInfo team={participant.team!} size="lg" />
                    <Chip
                      icon={
                        !participant.team!.arrived ? (
                          <Cancel />
                        ) : participant.ready ? (
                          <CheckCircle />
                        ) : participant.present ? (
                          <CheckCircle />
                        ) : (
                          <Warning />
                        )
                      }
                      label={
                        !participant.team!.arrived
                          ? t('no-show-title')
                          : participant.ready
                            ? t('ready-confirmed')
                            : participant.present
                              ? t('present')
                              : t('absent')
                      }
                      color={
                        !participant.team!.arrived
                          ? 'error'
                          : participant.ready
                            ? 'success'
                            : participant.present
                              ? 'primary'
                              : 'warning'
                      }
                      sx={{ fontSize: '1rem', py: 3, px: 2 }}
                    />
                  </Box>

                  {!participant.team!.arrived ? (
                    <Alert severity="error" sx={{ fontSize: '1rem' }}>
                      {t('no-show-description')}
                    </Alert>
                  ) : (
                    <>
                      <ToggleButtonGroup
                        value={participant.present ? 'present' : 'absent'}
                        exclusive
                        disabled={participant.ready}
                        onChange={(_, value) => {
                          if (value !== null) {
                            handleParticipantStatusChange(
                              participant.id,
                              'present',
                              value === 'present'
                            );
                          }
                        }}
                        fullWidth
                        sx={{
                          '& .MuiToggleButton-root': {
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 500
                          }
                        }}
                      >
                        <ToggleButton value="present">{t('present')}</ToggleButton>
                        <ToggleButton value="absent">{t('absent')}</ToggleButton>
                      </ToggleButtonGroup>

                      <Button
                        variant={participant.ready ? 'contained' : 'outlined'}
                        fullWidth
                        size="large"
                        onClick={() => {
                          handleParticipantStatusChange(
                            participant.id,
                            'ready',
                            !participant.ready
                          );
                        }}
                        sx={{
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 600
                        }}
                      >
                        {participant.ready ? t('ready-confirmed') : t('mark-ready')}
                      </Button>
                    </>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Paper>

      {inspectionStartTime && <InspectionTimer timeRemaining={inspectionTimeRemaining} />}
    </>
  );
}

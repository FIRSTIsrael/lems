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
import { useCallback, useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import { useMatchTranslations } from '@lems/localization';
import { useEvent } from '../../../components/event-context';
import { TeamInfo } from '../../components/team-info';
import { MatchParticipant, UPDATE_PARTICIPANT_STATUS } from '../graphql';
import { useReferee } from './referee-context';
import { InspectionTimer } from './inspection-timer';

// Utility functions for team status display
function getTeamBorderColor(participant: MatchParticipant): string {
  if (!participant.team?.arrived) return 'error.main';
  if (participant.ready) return 'success.main';
  if (participant.present) return 'primary.main';
  return 'warning.main';
}

function getTeamBackgroundColor(participant: MatchParticipant): string {
  if (!participant.team?.arrived) return 'error.50';
  if (participant.present) return 'success.50';
  return 'grey.50';
}

function getTeamStatusIcon(participant: MatchParticipant) {
  if (!participant.team?.arrived) return <Cancel />;
  if (participant.ready) return <CheckCircle />;
  if (participant.present) return <CheckCircle />;
  return <Warning />;
}

function getTeamStatusLabel(participant: MatchParticipant): string {
  if (!participant.team?.arrived) return 'no-show-title';
  if (participant.ready) return 'ready-confirmed';
  if (participant.present) return 'present';
  return 'absent';
}

function getTeamStatusChipColor(
  participant: MatchParticipant
): 'error' | 'success' | 'primary' | 'warning' {
  if (!participant.team?.arrived) return 'error';
  if (participant.ready) return 'success';
  if (participant.present) return 'primary';
  return 'warning';
}

export function RefereePrestart() {
  const t = useTranslations('pages.referee');
  const { getStage } = useMatchTranslations();
  const { currentDivision } = useEvent();
  const { loadedMatch } = useReferee();
  const [updateParticipant] = useMutation(UPDATE_PARTICIPANT_STATUS, {
    update(cache, { data }) {
      if (!data?.updateParticipantStatus) return;

      const { participantId, present, ready } = data.updateParticipantStatus;

      // Update the cache by modifying the participant's present/ready fields
      // Convert timestamp strings to booleans
      cache.modify({
        id: cache.identify({ __typename: 'MatchParticipant', id: participantId }),
        fields: {
          present() {
            return !!present;
          },
          ready() {
            return !!ready;
          }
        }
      });
    }
  });

  const [inspectionStartTime, setInspectionStartTime] = useState<number | null>(null);
  const prevAnyPresentRef = useRef<boolean>(false);

  const participant = loadedMatch?.participants.find(p => p.team);

  useEffect(() => {
    if (!loadedMatch || !participant) return;

    const isPresent = participant.present;
    if (isPresent === prevAnyPresentRef.current) return;

    prevAnyPresentRef.current = isPresent;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInspectionStartTime(isPresent ? Date.now() : null);
  }, [participant?.present, loadedMatch, participant]);

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

  if (!loadedMatch || !participant) {
    // This should only be rendered when we have a participant in a loaded match
    return null;
  }

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
              {t('prestart-title')}: {t('round')} {loadedMatch.round}, {t('match')}{' '}
              {getStage(loadedMatch.stage)} #{loadedMatch.number}
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            <Paper
              key={participant.team!.id}
              elevation={2}
              sx={{
                p: 2.5,
                borderRadius: 3,
                borderLeft: '5px solid',
                borderColor: getTeamBorderColor(participant),
                backgroundColor: getTeamBackgroundColor(participant),
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
                  <TeamInfo team={participant.team!} size="lg" />
                  <Chip
                    icon={getTeamStatusIcon(participant)}
                    label={t(getTeamStatusLabel(participant))}
                    color={getTeamStatusChipColor(participant)}
                    sx={{ fontSize: '0.9rem', py: 2.5, px: 1.5, fontWeight: 600 }}
                  />
                </Box>

                {!participant.team!.arrived && (
                  <Alert severity="error" sx={{ fontSize: '1rem' }}>
                    {t('no-show-description')}
                  </Alert>
                )}

                {participant.team!.arrived && (
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
                      variant={participant.ready ? 'contained' : 'outlined'}
                      fullWidth
                      size="large"
                      onClick={() => {
                        handleParticipantStatusChange(participant.id, 'ready', !participant.ready);
                      }}
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600
                      }}
                    >
                      {participant.ready ? t('ready-confirmed') : t('mark-ready')}
                    </Button>
                  </>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Stack>
      </Paper>

      {inspectionStartTime && !participant?.ready && (
        <InspectionTimer inspectionStartTime={inspectionStartTime} />
      )}
    </>
  );
}

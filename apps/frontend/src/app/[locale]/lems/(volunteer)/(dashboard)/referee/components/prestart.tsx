'use client';

import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Chip
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import { useTime } from '../../../../../../../lib/time/hooks';
import { useEvent } from '../../../components/event-context';
import { UPDATE_PARTICIPANT_STATUS } from '../graphql';
import { useReferee } from './referee-context';
import { InspectionTimer } from './inspection-timer';

const INSPECTION_DURATION = 5 * 60; // 5 minutes in seconds

export function RefereePrestart() {
  const t = useTranslations('pages.referee');
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
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '2px solid #667eea'
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          {t('prestart-title')} - {loadedMatch.slug}
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {teams.map(participant => (
            <Paper
              variant="outlined"
              key={participant.team!.id}
              sx={{
                p: 2,
                backgroundColor: participant.present ? '#e8f5e9' : '#fff3e0'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {participant.team!.number} - {participant.team!.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {participant.team!.affiliation} • {participant.team!.city}
                  </Typography>
                </Box>
                <Chip
                  label={participant.present ? t('present') : t('absent')}
                  color={participant.present ? 'success' : 'warning'}
                  variant="filled"
                  size="small"
                />
              </Box>

              <ToggleButtonGroup
                value={participant.present ? 'present' : 'absent'}
                exclusive
                disabled={participant.ready || !participant.present}
                onChange={(_, value) => {
                  if (value !== null) {
                    handleParticipantStatusChange(participant.id, 'present', value === 'present');
                  }
                }}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
              >
                <ToggleButton value="present" sx={{ flex: 1 }}>
                  {t('present')}
                </ToggleButton>
                <ToggleButton value="absent" sx={{ flex: 1 }}>
                  {t('absent')}
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                variant={participant.ready ? 'contained' : 'outlined'}
                fullWidth
                size="small"
                onClick={() => {
                  handleParticipantStatusChange(participant.id, 'ready', !participant.ready);
                }}
              >
                {participant.ready ? t('ready-confirmed') : t('mark-ready')}
              </Button>
            </Paper>
          ))}
        </Box>
      </Paper>

      {inspectionStartTime && <InspectionTimer timeRemaining={inspectionTimeRemaining} />}
    </>
  );
}

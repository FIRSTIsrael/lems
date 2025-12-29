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
import { useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import type { RefereeMatch } from '../graphql/types';
import { UPDATE_PARTICIPANT_STATUS } from '../graphql';
import { useReferee } from './referee-context';

interface RefereePrestartProps {
  match: RefereeMatch;
}

export function RefereePrestart({ match }: RefereePrestartProps) {
  const t = useTranslations('pages.referee');
  const { setInspectionStartTime } = useReferee();
  const [updateParticipant] = useMutation(UPDATE_PARTICIPANT_STATUS);

  const teams = match.participants.filter(p => p.team);

  const handleParticipantStatusChange = useCallback(
    (teamId: string, present: boolean, ready: boolean) => {
      updateParticipant({
        variables: {
          matchId: match.id,
          teamId,
          present,
          ready
        }
      });
    },
    [match.id, updateParticipant]
  );

  const handleStartInspection = useCallback(() => {
    setInspectionStartTime(Date.now());
  }, [setInspectionStartTime]);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        border: '2px solid #667eea'
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        {t('prestart-title')} - {match.slug}
      </Typography>

      {/* Teams Status */}
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
              onChange={(_, value) => {
                if (value !== null) {
                  handleParticipantStatusChange(
                    participant.team!.id,
                    value === 'present',
                    participant.ready
                  );
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

            {participant.present && (
              <Button
                variant={participant.ready ? 'contained' : 'outlined'}
                fullWidth
                size="small"
                onClick={() =>
                  handleParticipantStatusChange(participant.team!.id, true, !participant.ready)
                }
              >
                {participant.ready ? t('ready-confirmed') : t('mark-ready')}
              </Button>
            )}
          </Paper>
        ))}
      </Box>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        onClick={handleStartInspection}
        sx={{ textTransform: 'none', fontSize: '1rem' }}
      >
        {t('start-inspection')}
      </Button>
    </Paper>
  );
}

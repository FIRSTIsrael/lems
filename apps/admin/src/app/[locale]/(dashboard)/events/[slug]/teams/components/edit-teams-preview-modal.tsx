'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Chip
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { TeamWithDivision, SwapTeamsRequest, ReplaceTeamRequest } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';

interface EditTeamsPreviewModalProps {
  open: boolean;
  onClose: () => void;
  selectedTeam: TeamWithDivision;
  secondaryTeam: TeamWithDivision;
  eventId: string;
}

export const EditTeamsPreviewModal = ({
  open,
  onClose,
  selectedTeam,
  secondaryTeam,
  eventId
}: EditTeamsPreviewModalProps) => {
  const t = useTranslations('pages.events.teams.edit-teams-preview-modal');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSwap = selectedTeam.division.id === secondaryTeam.division.id;
  const operationType = isSwap ? 'swap' : 'replace';

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isSwap) {
        const payload: SwapTeamsRequest = {
          team1Id: selectedTeam.id,
          team1DivisionId: selectedTeam.division.id,
          team2Id: secondaryTeam.id,
          team2DivisionId: secondaryTeam.division.id
        };

        const result = await apiFetch(`/admin/events/${eventId}/teams/swap-teams`, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' }
        });

        if (!result.ok) {
          setError(t('error'));
          setIsLoading(false);
          return;
        }
      } else {
        const payload: ReplaceTeamRequest = {
          currentTeamId: selectedTeam.id,
          newTeamId: secondaryTeam.id,
          divisionId: selectedTeam.division.id
        };

        const result = await apiFetch(`/admin/events/${eventId}/teams/replace-team`, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' }
        });

        if (!result.ok) {
          setError(t('error'));
          setIsLoading(false);
          return;
        }
      }

      // Invalidate cache
      await mutate(`/admin/events/${eventId}/teams`);
      onClose();
    } catch {
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              {operationType === 'swap' ? t('swap-teams') : t('replace-team')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {operationType === 'swap'
                ? t('swap-description', {
                    team1Number: selectedTeam.number,
                    team2Number: secondaryTeam.number
                  })
                : t('replace-description', {
                    currentTeamNumber: selectedTeam.number,
                    newTeamNumber: secondaryTeam.number
                  })}
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Paper sx={{ p: 2, backgroundColor: 'action.hover', flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                {t('before')}
              </Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Team 1
                  </Typography>
                  <Chip
                    label={`#${selectedTeam.number} - ${selectedTeam.name}`}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                {operationType === 'swap' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Team 2
                    </Typography>
                    <Chip
                      label={`#${secondaryTeam.number} - ${secondaryTeam.name}`}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, backgroundColor: 'success.light', flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                {t('after')}
              </Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {operationType === 'swap' ? 'Team 1 (swapped)' : 'Team (replaced)'}
                  </Typography>
                  <Chip
                    label={`#${operationType === 'swap' ? secondaryTeam.number : secondaryTeam.number} - ${operationType === 'swap' ? secondaryTeam.name : secondaryTeam.name}`}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                {operationType === 'swap' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Team 2 (swapped)
                    </Typography>
                    <Chip
                      label={`#${selectedTeam.number} - ${selectedTeam.name}`}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                )}
              </Stack>
            </Paper>
          </Stack>

          <Box sx={{ p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('affected-matches', { count: 3 })} (Mock data)
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {t('actions.cancel')}
        </Button>
        <Button onClick={handleConfirm} variant="contained" disabled={isLoading}>
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              {t('actions.confirming')}
            </>
          ) : (
            t('actions.confirm')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

'use client';

import { useState, useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import { useTranslations } from 'next-intl';
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { toast } from 'react-hot-toast';
import { useMatchTranslations } from '@lems/localization';
import type { TournamentManagerData, MatchParticipant } from '../graphql';
import { SWAP_MATCH_TEAMS } from '../graphql';

interface MatchSwapFormProps {
  division: TournamentManagerData['division'];
  onSwapComplete: () => Promise<void>;
}

export function MatchSwapForm({ division, onSwapComplete }: MatchSwapFormProps) {
  const t = useTranslations('pages.tournament-manager');
  const { getStage } = useMatchTranslations();

  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [participant1Id, setParticipant1Id] = useState<string>('');
  const [participant2Id, setParticipant2Id] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [swapMatchTeams, { loading: swapping }] = useMutation(SWAP_MATCH_TEAMS);

  // Filter eligible matches (not-started, not loaded)
  const eligibleMatches = useMemo(() => {
    return division.field.matches.filter(
      match =>
        match.status === 'not-started' &&
        match.id !== division.field.loadedMatch &&
        match.id !== division.field.activeMatch
    );
  }, [division.field.matches, division.field.loadedMatch, division.field.activeMatch]);

  // Get selected match
  const selectedMatch = useMemo(() => {
    return eligibleMatches.find(m => m.id === selectedMatchId);
  }, [eligibleMatches, selectedMatchId]);

  // Get participants from selected match
  const participants = useMemo(() => {
    return selectedMatch?.participants || [];
  }, [selectedMatch]);

  // Get selected participants
  const participant1 = useMemo(() => {
    return participants.find(p => p.id === participant1Id);
  }, [participants, participant1Id]);

  const participant2 = useMemo(() => {
    return participants.find(p => p.id === participant2Id);
  }, [participants, participant2Id]);

  // Reset participant selection when match changes
  const handleMatchChange = (matchId: string) => {
    setSelectedMatchId(matchId);
    setParticipant1Id('');
    setParticipant2Id('');
  };

  const canSwap =
    selectedMatchId && participant1Id && participant2Id && participant1Id !== participant2Id;

  const handleSwap = async () => {
    if (!canSwap) return;

    try {
      await swapMatchTeams({
        variables: {
          divisionId: division.id,
          matchId: selectedMatchId,
          participantId1: participant1Id,
          participantId2: participant2Id
        }
      });

      toast.success(t('swap-success'));
      setConfirmDialogOpen(false);

      // Reset form
      setSelectedMatchId('');
      setParticipant1Id('');
      setParticipant2Id('');

      // Trigger refetch
      await onSwapComplete();
    } catch (error) {
      console.error('Swap error:', error);
      const errorMessage = error instanceof Error ? error.message : t('swap-error');
      toast.error(errorMessage);
      setConfirmDialogOpen(false);
    }
  };

  const formatParticipant = (p: MatchParticipant) => {
    if (!p.team) return `${p.table.name}: ${t('no-team')}`;
    return `${p.table.name}: #${p.team.number} ${p.team.name}`;
  };

  if (eligibleMatches.length === 0) {
    return <Alert severity="info">{t('no-eligible-matches')}</Alert>;
  }

  return (
    <>
      <Stack spacing={3}>
        <FormControl fullWidth>
          <InputLabel>{t('select-match')}</InputLabel>
          <Select
            value={selectedMatchId}
            onChange={e => handleMatchChange(e.target.value)}
            label={t('select-match')}
          >
            {eligibleMatches.map(match => (
              <MenuItem key={match.id} value={match.id}>
                {getStage(match.stage)} #{match.number} - Round {match.round}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedMatch && (
          <>
            <FormControl fullWidth>
              <InputLabel>{t('select-participant-1')}</InputLabel>
              <Select
                value={participant1Id}
                onChange={e => setParticipant1Id(e.target.value)}
                label={t('select-participant-1')}
              >
                {participants.map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {formatParticipant(p)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('select-participant-2')}</InputLabel>
              <Select
                value={participant2Id}
                onChange={e => setParticipant2Id(e.target.value)}
                label={t('select-participant-2')}
              >
                {participants.map(p => (
                  <MenuItem key={p.id} value={p.id} disabled={p.id === participant1Id}>
                    {formatParticipant(p)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {participant1 && participant2 && participant1Id !== participant2Id && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  {t('swap-preview')}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Chip
                      label={participant1.table.name}
                      size="small"
                      color="primary"
                      sx={{ mb: 0.5 }}
                    />
                    <Typography variant="body2">
                      {participant1.team
                        ? `#${participant1.team.number} ${participant1.team.name}`
                        : t('no-team')}
                    </Typography>
                  </Box>
                  <SwapHorizIcon color="action" />
                  <Box sx={{ flex: 1 }}>
                    <Chip
                      label={participant2.table.name}
                      size="small"
                      color="secondary"
                      sx={{ mb: 0.5 }}
                    />
                    <Typography variant="body2">
                      {participant2.team
                        ? `#${participant2.team.number} ${participant2.team.name}`
                        : t('no-team')}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={!canSwap || swapping}
              onClick={() => setConfirmDialogOpen(true)}
              startIcon={swapping ? <CircularProgress size={20} /> : <SwapHorizIcon />}
            >
              {t('swap-teams')}
            </Button>
          </>
        )}
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>{t('confirm-swap')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('confirm-swap-message', {
              table1: participant1?.table.name || '',
              team1: participant1?.team ? `#${participant1.team.number}` : t('no-team'),
              table2: participant2?.table.name || '',
              team2: participant2?.team ? `#${participant2.team.number}` : t('no-team')
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={swapping}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSwap} variant="contained" disabled={swapping} autoFocus>
            {swapping ? <CircularProgress size={20} /> : t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

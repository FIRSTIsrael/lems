'use client';

import { useState, useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
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
import type { TournamentManagerData, JudgingSession } from '../graphql';
import { SWAP_SESSION_TEAMS } from '../graphql';

interface JudgingSwapFormProps {
  division: TournamentManagerData['division'];
  onSwapComplete: () => Promise<void>;
}

export function JudgingSwapForm({ division, onSwapComplete }: JudgingSwapFormProps) {
  const t = useTranslations('pages.tournament-manager');

  const [sessionId1, setSessionId1] = useState<string>('');
  const [sessionId2, setSessionId2] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [swapSessionTeams, { loading: swapping }] = useMutation(SWAP_SESSION_TEAMS);

  // Filter eligible sessions (not-started, not called)
  const eligibleSessions = useMemo(() => {
    return division.judging.sessions.filter(
      session => session.status === 'not-started' && !session.called
    );
  }, [division.judging.sessions]);

  // Get selected sessions
  const session1 = useMemo(() => {
    return eligibleSessions.find(s => s.id === sessionId1);
  }, [eligibleSessions, sessionId1]);

  const session2 = useMemo(() => {
    return eligibleSessions.find(s => s.id === sessionId2);
  }, [eligibleSessions, sessionId2]);

  const canSwap = sessionId1 && sessionId2 && sessionId1 !== sessionId2;

  const handleSwap = async () => {
    if (!canSwap) return;

    try {
      await swapSessionTeams({
        variables: {
          divisionId: division.id,
          sessionId1,
          sessionId2
        }
      });

      toast.success(t('swap-success'));
      setConfirmDialogOpen(false);

      // Reset form
      setSessionId1('');
      setSessionId2('');

      // Trigger refetch
      await onSwapComplete();
    } catch (error) {
      console.error('Swap error:', error);
      const errorMessage = error instanceof Error ? error.message : t('swap-error');
      toast.error(errorMessage);
      setConfirmDialogOpen(false);
    }
  };

  const formatSession = (session: JudgingSession) => {
    const time = dayjs(session.scheduledTime).format('HH:mm');
    const team = session.team ? `#${session.team.number} ${session.team.name}` : t('no-team');
    return `${time} - ${session.room.name} - ${team}`;
  };

  if (eligibleSessions.length === 0) {
    return <Alert severity="info">{t('no-eligible-sessions')}</Alert>;
  }

  return (
    <>
      <Stack spacing={3}>
        <FormControl fullWidth>
          <InputLabel>{t('select-session-1')}</InputLabel>
          <Select
            value={sessionId1}
            onChange={e => setSessionId1(e.target.value)}
            label={t('select-session-1')}
          >
            {eligibleSessions.map(session => (
              <MenuItem key={session.id} value={session.id}>
                {formatSession(session)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>{t('select-session-2')}</InputLabel>
          <Select
            value={sessionId2}
            onChange={e => setSessionId2(e.target.value)}
            label={t('select-session-2')}
          >
            {eligibleSessions.map(session => (
              <MenuItem key={session.id} value={session.id} disabled={session.id === sessionId1}>
                {formatSession(session)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {session1 && session2 && sessionId1 !== sessionId2 && (
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
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <Chip
                    label={`${dayjs(session1.scheduledTime).format('HH:mm')} - ${session1.room.name}`}
                    size="small"
                    color="primary"
                    sx={{ mb: 0.5 }}
                  />
                  <Typography variant="body2">
                    {session1.team
                      ? `#${session1.team.number} ${session1.team.name}`
                      : t('no-team')}
                  </Typography>
                </Box>
                <SwapHorizIcon color="action" />
                <Box sx={{ flex: 1 }}>
                  <Chip
                    label={`${dayjs(session2.scheduledTime).format('HH:mm')} - ${session2.room.name}`}
                    size="small"
                    color="secondary"
                    sx={{ mb: 0.5 }}
                  />
                  <Typography variant="body2">
                    {session2.team
                      ? `#${session2.team.number} ${session2.team.name}`
                      : t('no-team')}
                  </Typography>
                </Box>
              </Stack>
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
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>{t('confirm-swap')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('confirm-session-swap-message', {
              room1: session1?.room.name || '',
              team1: session1?.team ? `#${session1.team.number}` : t('no-team'),
              room2: session2?.room.name || '',
              team2: session2?.team ? `#${session2.team.number}` : t('no-team')
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

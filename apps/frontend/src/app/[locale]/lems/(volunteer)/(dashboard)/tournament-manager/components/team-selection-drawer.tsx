import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Alert,
  Divider,
  Paper,
  Chip,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import type { TournamentManagerData } from '../graphql';

interface SlotInfo {
  type: 'match' | 'session';
  matchId?: string;
  participantId?: string;
  sessionId?: string;
  team: { id: string; number: number; name: string } | null;
  tableName?: string;
  roomName?: string;
  time?: string;
}

interface TeamSelectionDrawerProps {
  open: boolean;
  selectedSlot: SlotInfo | null;
  secondSlot: SlotInfo | null;
  error: string | null;
  isMobile: boolean;
  division: TournamentManagerData['division'];
  onClose: () => void;
  onMove: () => void;
  onReplace: () => void;
  onClearError: () => void;
  getStage: (stage: string) => string;
  t: (key: string) => string;
}

export function TeamSelectionDrawer({
  open,
  selectedSlot,
  secondSlot,
  error,
  isMobile,
  division,
  onClose,
  onMove,
  onReplace,
  onClearError,
  getStage,
  t
}: TeamSelectionDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{
        '& .MuiDrawer-paper': {
          width: isMobile ? '90%' : 400,
          boxSizing: 'border-box',
          p: 3
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {selectedSlot?.type === 'match'
              ? `${t('match')} - ${selectedSlot.tableName}`
              : `${t('session')} - ${selectedSlot?.roomName}`}
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary">
            #{selectedSlot?.team?.number} {selectedSlot?.team?.name}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {selectedSlot && (
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={onClearError}>
              {error}
            </Alert>
          )}

          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t('field-matches')}
            </Typography>
            <Stack spacing={1}>
              {division.field.matches
                .filter((match) => match.participants.some((p) => p.team?.id === selectedSlot?.team?.id))
                .map((match) => {
                  const participant = match.participants.find(
                    (p) => p.team?.id === selectedSlot?.team?.id
                  );
                  return (
                    <Paper key={match.id} sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {getStage(match.stage)} #{match.number}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {participant?.table.name} • {dayjs(match.scheduledTime).format('HH:mm')}
                          </Typography>
                        </Box>
                        <Chip label={match.status} size="small" sx={{ fontSize: '0.7rem' }} />
                      </Stack>
                    </Paper>
                  );
                })}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t('judging-sessions')}
            </Typography>
            <Stack spacing={1}>
              {division.judging.sessions
                .filter((session) => session.team?.id === selectedSlot?.team?.id)
                .map((session) => (
                  <Paper key={session.id} sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {t('session')} #{session.number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {session.room.name} • {dayjs(session.scheduledTime).format('HH:mm')}
                        </Typography>
                      </Box>
                      <Chip label={session.status} size="small" sx={{ fontSize: '0.7rem' }} />
                    </Stack>
                  </Paper>
                ))}
            </Stack>
          </Box>

          {secondSlot && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {t('second-team-selected')}
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'secondary.light' }}>
                  <Typography variant="body1" fontWeight={700}>
                    #{secondSlot.team?.number} {secondSlot.team?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {secondSlot.type === 'match'
                      ? `${secondSlot.tableName} • ${secondSlot.time}`
                      : `${secondSlot.roomName} • ${secondSlot.time}`}
                  </Typography>
                </Paper>
              </Box>

              <Stack spacing={2}>
                <Button variant="contained" color="primary" fullWidth onClick={onMove}>
                  {t('move-team')}
                </Button>
                <Button variant="contained" color="secondary" fullWidth onClick={onReplace}>
                  {t('replace-team')}
                </Button>
                <Button variant="outlined" fullWidth onClick={onClose}>
                  {t('cancel')}
                </Button>
              </Stack>
            </>
          )}

          {!secondSlot && (
            <Box>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {t('select-second-team-instruction')}
              </Typography>
            </Box>
          )}
        </Stack>
      )}
    </Drawer>
  );
}

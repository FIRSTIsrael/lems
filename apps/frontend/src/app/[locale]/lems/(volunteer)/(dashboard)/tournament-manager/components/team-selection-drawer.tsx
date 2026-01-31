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
  Button,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import type { TournamentManagerData } from '../graphql';

interface SlotInfo {
  type: 'match' | 'session';
  matchId?: string;
  participantId?: string;
  sessionId?: string;
  team: { id: string; number: number; name: string; affiliation?: string; city?: string } | null;
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
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{
        '& .MuiDrawer-paper': {
          width: isMobile ? '100%' : 400,
          height: isMobile ? '60vh' : 'auto',
          maxHeight: isMobile ? '60vh' : '100vh',
          boxSizing: 'border-box',
          p: 3,
          overflowY: 'auto'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            {selectedSlot?.type === 'match'
              ? `${t('match')} - ${selectedSlot.tableName}`
              : `${t('session')} - ${selectedSlot?.roomName}`}
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary" noWrap>
            #{selectedSlot?.team?.number} {selectedSlot?.team?.name}
          </Typography>
          {(selectedSlot?.team?.affiliation || selectedSlot?.team?.city) && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {[selectedSlot.team.affiliation, selectedSlot.team.city].filter(Boolean).join(' • ')}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', ml: 1 }}>
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
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : '1fr',
                gap: 1
              }}
            >
              {division.field.matches
                .filter(match =>
                  match.participants.some(p => p.team?.id === selectedSlot?.team?.id)
                )
                .map(match => {
                  const participant = match.participants.find(
                    p => p.team?.id === selectedSlot?.team?.id
                  );
                  return (
                    <Paper key={match.id} sx={{ p: 1, bgcolor: 'action.hover' }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          sx={{ flex: 1, minWidth: 0 }}
                        >
                          {getStage(match.stage)} #{match.number} • {participant?.table.name} •{' '}
                          {dayjs(match.scheduledTime).format('HH:mm')}
                        </Typography>
                        <Chip
                          label={match.status}
                          size="small"
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      </Stack>
                    </Paper>
                  );
                })}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t('judging-sessions')}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : '1fr',
                gap: 1
              }}
            >
              {division.judging.sessions
                .filter(session => session.team?.id === selectedSlot?.team?.id)
                .map(session => (
                  <Paper key={session.id} sx={{ p: 1, bgcolor: 'action.hover' }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                        sx={{ flex: 1, minWidth: 0 }}
                      >
                        {t('session')} #{session.number} • {session.room.name} •{' '}
                        {dayjs(session.scheduledTime).format('HH:mm')}
                      </Typography>
                      <Chip
                        label={session.status}
                        size="small"
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    </Stack>
                  </Paper>
                ))}
            </Box>
          </Box>

          {secondSlot && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {t('second-team-selected')}
                </Typography>
                <Paper sx={{ p: 1.5, bgcolor: 'rgba(25, 118, 210, 0.3)' }}>
                  <Typography variant="body1" fontWeight={700} noWrap>
                    #{secondSlot.team?.number} {secondSlot.team?.name}
                  </Typography>
                  {(secondSlot?.team?.affiliation || secondSlot?.team?.city) && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {[secondSlot.team.affiliation, secondSlot.team.city]
                        .filter(Boolean)
                        .join(' • ')}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: 'block' }}
                  >
                    {secondSlot.type === 'match'
                      ? `${secondSlot.tableName} • ${secondSlot.time}`
                      : `${secondSlot.roomName} • ${secondSlot.time}`}
                  </Typography>
                </Paper>
              </Box>

              {secondSlot.team && (
                <>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {t('field-matches')}
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : '1fr',
                        gap: 1
                      }}
                    >
                      {division.field.matches
                        .filter(match =>
                          match.participants.some(p => p.team?.id === secondSlot.team?.id)
                        )
                        .map(match => {
                          const participant = match.participants.find(
                            p => p.team?.id === secondSlot.team?.id
                          );
                          return (
                            <Paper key={match.id} sx={{ p: 1, bgcolor: 'action.hover' }}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={1}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  noWrap
                                  sx={{ flex: 1, minWidth: 0 }}
                                >
                                  {getStage(match.stage)} #{match.number} •{' '}
                                  {participant?.table.name} •{' '}
                                  {dayjs(match.scheduledTime).format('HH:mm')}
                                </Typography>
                                <Chip
                                  label={match.status}
                                  size="small"
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                              </Stack>
                            </Paper>
                          );
                        })}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {t('judging-sessions')}
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : '1fr',
                        gap: 1
                      }}
                    >
                      {division.judging.sessions
                        .filter(session => session.team?.id === secondSlot.team?.id)
                        .map(session => (
                          <Paper key={session.id} sx={{ p: 1, bgcolor: 'action.hover' }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              spacing={1}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                noWrap
                                sx={{ flex: 1, minWidth: 0 }}
                              >
                                {t('session')} #{session.number} • {session.room.name} •{' '}
                                {dayjs(session.scheduledTime).format('HH:mm')}
                              </Typography>
                              <Chip
                                label={session.status}
                                size="small"
                                sx={{ fontSize: '0.65rem', height: 20 }}
                              />
                            </Stack>
                          </Paper>
                        ))}
                    </Box>
                  </Box>
                </>
              )}

              <Stack direction="row" spacing={1}>
                <Tooltip title={t('move-tooltip')} arrow>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onMove}
                    sx={{ flex: 1, minWidth: 150, px: 3 }}
                  >
                    {t('move')}
                  </Button>
                </Tooltip>
                <Tooltip title={t('replace-tooltip')} arrow>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={onReplace}
                    sx={{ flex: 1, minWidth: 150, px: 3 }}
                  >
                    {t('replace')}
                  </Button>
                </Tooltip>
              </Stack>
              <Button variant="outlined" fullWidth onClick={onClose} sx={{ minWidth: 150, px: 3 }}>
                {t('cancel')}
              </Button>
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

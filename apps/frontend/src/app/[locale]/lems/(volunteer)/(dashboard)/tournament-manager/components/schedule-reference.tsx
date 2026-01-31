'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import {
  Paper,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
  Drawer,
  Button,
  Stack,
  Divider,
  Chip,
  Alert,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { useMatchTranslations } from '@lems/localization';
import type { TournamentManagerData } from '../graphql';
import {
  SWAP_MATCH_TEAMS,
  SWAP_SESSION_TEAMS,
  SET_MATCH_PARTICIPANT_TEAM,
  GET_TOURNAMENT_MANAGER_DATA
} from '../graphql';

interface ScheduleReferenceProps {
  division: TournamentManagerData['division'];
}

export function ScheduleReference({ division }: ScheduleReferenceProps) {
  const t = useTranslations('pages.tournament-manager');
  const { getStage } = useMatchTranslations();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<{
    type: 'match' | 'session';
    matchId?: string;
    participantId?: string;
    sessionId?: string;
    team: { id: string; number: number; name: string } | null;
    tableName?: string;
    roomName?: string;
    time?: string;
  } | null>(null);
  const [secondSlot, setSecondSlot] = useState<{
    type: 'match' | 'session';
    matchId?: string;
    participantId?: string;
    sessionId?: string;
    team: { id: string; number: number; name: string } | null;
    tableName?: string;
    roomName?: string;
    time?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [swapMatchTeams] = useMutation(SWAP_MATCH_TEAMS, {
    refetchQueries: [{ query: GET_TOURNAMENT_MANAGER_DATA, variables: { divisionId: division.id } }]
  });

  const [swapSessionTeams] = useMutation(SWAP_SESSION_TEAMS, {
    refetchQueries: [{ query: GET_TOURNAMENT_MANAGER_DATA, variables: { divisionId: division.id } }]
  });

  const [setMatchParticipantTeam] = useMutation(SET_MATCH_PARTICIPANT_TEAM, {
    refetchQueries: [{ query: GET_TOURNAMENT_MANAGER_DATA, variables: { divisionId: division.id } }]
  });

  const handleMove = async () => {
    if (!selectedSlot || !secondSlot) return;

    setError(null);
    try {
      // Move: Move first team to second slot and remove from original slot
      if (selectedSlot.type === 'match' && secondSlot.type === 'match') {
        if (
          !selectedSlot.participantId ||
          !secondSlot.participantId ||
          !selectedSlot.matchId ||
          !secondSlot.matchId
        )
          return;

        // Step 1: Move first team to second slot
        await setMatchParticipantTeam({
          variables: {
            divisionId: division.id,
            matchId: secondSlot.matchId,
            participantId: secondSlot.participantId,
            teamId: selectedSlot.team?.id || null
          }
        });

        // Step 2: Remove team from original slot (set to null)
        await setMatchParticipantTeam({
          variables: {
            divisionId: division.id,
            matchId: selectedSlot.matchId,
            participantId: selectedSlot.participantId,
            teamId: null
          }
        });
      }
      // TODO: Handle judging session moves when needed

      setSelectedSlot(null);
      setSecondSlot(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move team');
    }
  };

  const handleReplace = async () => {
    if (!selectedSlot || !secondSlot) return;

    setError(null);
    try {
      // Replace: Swap the two teams in those specific slots
      if (selectedSlot.type === 'match' && secondSlot.type === 'match') {
        if (
          !selectedSlot.participantId ||
          !secondSlot.participantId ||
          !selectedSlot.matchId ||
          !secondSlot.matchId
        )
          return;

        await swapMatchTeams({
          variables: {
            divisionId: division.id,
            matchId: selectedSlot.matchId,
            participantId1: selectedSlot.participantId,
            participantId2: secondSlot.participantId
          }
        });
      } else if (selectedSlot.type === 'session' && secondSlot.type === 'session') {
        if (!selectedSlot.sessionId || !secondSlot.sessionId) return;

        await swapSessionTeams({
          variables: {
            divisionId: division.id,
            sessionId1: selectedSlot.sessionId,
            sessionId2: secondSlot.sessionId
          }
        });
      }

      setSelectedSlot(null);
      setSecondSlot(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to replace teams');
    }
  };

  const tables = division.tables || [];
  const rooms = division.rooms || [];

  const groupedMatches = division.field.matches.reduce(
    (acc, match) => {
      const key = `${match.stage}-${match.round}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(match);
      return acc;
    },
    {} as Record<string, typeof division.field.matches>
  );

  const groupedSessions = division.judging.sessions.reduce(
    (acc, session) => {
      const timeKey = dayjs(session.scheduledTime).format('HH:mm');
      if (!acc[timeKey]) {
        acc[timeKey] = { time: session.scheduledTime, sessions: [] };
      }
      acc[timeKey].sessions.push(session);
      return acc;
    },
    {} as Record<string, { time: string; sessions: typeof division.judging.sessions }>
  );

  const sessionRows = Object.values(groupedSessions).sort((a, b) =>
    dayjs(a.time).diff(dayjs(b.time))
  );

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'margin-right 0.3s',
          marginRight: selectedSlot ? (isMobile ? '90%' : '400px') : 0
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.default',
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 2
            }
          }}
        >
          <Tab label={t('match-schedule')} />
          <Tab label={t('judging-schedule')} />
        </Tabs>

        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
          {activeTab === 0 && (
            <Box sx={{ p: 2 }}>
              {Object.entries(groupedMatches).map(([key, matches]) => {
                const firstMatch = matches[0];
                const roundTitle = `${getStage(firstMatch.stage)} ${firstMatch.round}`;

                return (
                  <TableContainer
                    key={key}
                    component={Paper}
                    sx={{ p: 0, bgcolor: 'white', mb: 3 }}
                  >
                    <Table
                      size="small"
                      sx={{
                        tableLayout: 'fixed',
                        width: '100%',
                        minWidth: Math.max(400, 100 + tables.length * 100)
                      }}
                    >
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                          <TableCell colSpan={tables.length + 3}>
                            <Typography
                              variant="h6"
                              fontWeight={600}
                              fontSize={isMobile ? '0.875rem' : '1rem'}
                            >
                              {roundTitle}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                          <TableCell align="center">
                            <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                              {t('match')}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                              {t('start-time')}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                              {t('end-time')}
                            </Typography>
                          </TableCell>
                          {tables.map((table: { id: string; name: string }) => (
                            <TableCell key={table.id} align="center">
                              <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                                {table.name}
                              </Typography>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {matches.map(match => {
                          const startTime = dayjs(match.scheduledTime);
                          const endTime = startTime.add(150, 'seconds');
                          const tableParticipants = new Map(
                            match.participants.map(p => [p.table.id, p] as const)
                          );
                          const isCompleted = match.status === 'completed';
                          const isActive = match.id === division.field.activeMatch;
                          const isLoaded = match.id === division.field.loadedMatch;

                          return (
                            <TableRow
                              key={match.id}
                              sx={{
                                bgcolor: isLoaded
                                  ? 'action.selected'
                                  : isActive
                                    ? 'warning.light'
                                    : isCompleted
                                      ? 'action.hover'
                                      : 'white'
                              }}
                            >
                              <TableCell align="center">
                                <Typography
                                  fontFamily="monospace"
                                  fontWeight={500}
                                  fontSize={isMobile ? '0.75rem' : '1rem'}
                                >
                                  {match.number}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography
                                  fontFamily="monospace"
                                  fontWeight={500}
                                  fontSize={isMobile ? '0.75rem' : '1rem'}
                                >
                                  {startTime.format('HH:mm')}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography
                                  fontFamily="monospace"
                                  fontWeight={500}
                                  fontSize={isMobile ? '0.75rem' : '1rem'}
                                >
                                  {endTime.format('HH:mm')}
                                </Typography>
                              </TableCell>
                              {tables.map((table: { id: string; name: string }) => {
                                const participant = tableParticipants.get(table.id);
                                const team = participant?.team;

                                return (
                                  <TableCell key={table.id} align="center">
                                    <Box
                                      onClick={() => {
                                        const slot = {
                                          type: 'match' as const,
                                          matchId: match.id,
                                          participantId: participant?.id,
                                          team: team || null,
                                          tableName: table.name,
                                          time: dayjs(match.scheduledTime).format('HH:mm')
                                        };

                                        if (!selectedSlot) {
                                          setSelectedSlot(slot);
                                        } else if (selectedSlot.participantId !== participant?.id) {
                                          setSecondSlot(slot);
                                        }
                                      }}
                                      sx={{
                                        display: 'inline-flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 0.25,
                                        cursor: 'pointer',
                                        p: 0.5,
                                        borderRadius: 1,
                                        bgcolor:
                                          selectedSlot?.participantId === participant?.id
                                            ? 'primary.light'
                                            : secondSlot?.participantId === participant?.id
                                              ? 'secondary.light'
                                              : 'transparent',
                                        '&:hover': {
                                          bgcolor:
                                            selectedSlot?.participantId === participant?.id
                                              ? 'primary.light'
                                              : secondSlot?.participantId === participant?.id
                                                ? 'secondary.light'
                                                : 'action.hover'
                                        },
                                        transition: 'background-color 0.2s'
                                      }}
                                    >
                                      {team ? (
                                        <>
                                          <Typography
                                            component="span"
                                            sx={{
                                              fontSize: isMobile ? '0.7rem' : '0.9rem',
                                              fontWeight: 600
                                            }}
                                          >
                                            #{team.number}
                                          </Typography>
                                          <Typography
                                            component="span"
                                            sx={{
                                              fontSize: isMobile ? '0.65rem' : '0.75rem',
                                              color: 'text.secondary',
                                              textAlign: 'center',
                                              lineHeight: 1.2,
                                              maxWidth: '100px',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap'
                                            }}
                                          >
                                            {team.name}
                                          </Typography>
                                        </>
                                      ) : (
                                        <Typography variant="caption" color="text.secondary">
                                          -
                                        </Typography>
                                      )}
                                    </Box>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                );
              })}
            </Box>
          )}

          {activeTab === 1 && (
            <TableContainer component={Paper} sx={{ p: 0, bgcolor: 'white', m: 2 }}>
              <Table
                size="small"
                sx={{
                  tableLayout: 'fixed',
                  width: '100%',
                  minWidth: Math.max(400, 100 + rooms.length * 100)
                }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell width={80} align="center">
                      <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                        {t('start-time')}
                      </Typography>
                    </TableCell>
                    <TableCell width={80} align="center">
                      <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                        {t('end-time')}
                      </Typography>
                    </TableCell>
                    {rooms.map((room: { id: string; name: string }) => (
                      <TableCell key={room.id} align="center">
                        <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                          {room.name}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessionRows.map((row, index) => {
                    const sessionTime = dayjs(row.time);
                    const sessionEndTime = sessionTime.add(
                      division.judging.sessionLength,
                      'seconds'
                    );
                    const roomSessions = new Map(row.sessions.map(s => [s.room.id, s] as const));

                    const allSessionsCompleted = row.sessions.every(s => s.status === 'completed');
                    const anyCalled = row.sessions.some(s => s.called);

                    return (
                      <TableRow
                        key={`session-${index}`}
                        sx={{
                          bgcolor: anyCalled
                            ? 'info.light'
                            : allSessionsCompleted
                              ? 'grey.100'
                              : 'white'
                        }}
                      >
                        <TableCell align="center">
                          <Typography
                            fontFamily="monospace"
                            fontWeight={500}
                            fontSize={isMobile ? '0.75rem' : '1rem'}
                          >
                            {sessionTime.format('HH:mm')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            fontFamily="monospace"
                            fontWeight={500}
                            fontSize={isMobile ? '0.75rem' : '1rem'}
                          >
                            {sessionEndTime.format('HH:mm')}
                          </Typography>
                        </TableCell>
                        {rooms.map((room: { id: string; name: string }) => {
                          const session = roomSessions.get(room.id);
                          const team = session?.team;

                          return (
                            <TableCell key={room.id} align="center">
                              {team ? (
                                <Box
                                  onClick={() => {
                                    const slot = {
                                      type: 'session' as const,
                                      sessionId: session?.id,
                                      team: team,
                                      roomName: room.name,
                                      time: sessionTime.format('HH:mm')
                                    };

                                    if (!selectedSlot) {
                                      setSelectedSlot(slot);
                                    } else if (selectedSlot.sessionId !== session?.id) {
                                      setSecondSlot(slot);
                                    }
                                  }}
                                  sx={{
                                    display: 'inline-flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 0.25,
                                    cursor: 'pointer',
                                    p: 0.5,
                                    borderRadius: 1,
                                    bgcolor:
                                      selectedSlot?.sessionId === session?.id
                                        ? 'primary.light'
                                        : secondSlot?.sessionId === session?.id
                                          ? 'secondary.light'
                                          : 'transparent',
                                    '&:hover': {
                                      bgcolor:
                                        selectedSlot?.sessionId === session?.id
                                          ? 'primary.light'
                                          : secondSlot?.sessionId === session?.id
                                            ? 'secondary.light'
                                            : 'action.hover'
                                    },
                                    transition: 'background-color 0.2s'
                                  }}
                                >
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontSize: isMobile ? '0.7rem' : '0.9rem',
                                      fontWeight: 600
                                    }}
                                  >
                                    #{team.number}
                                  </Typography>
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontSize: isMobile ? '0.65rem' : '0.75rem',
                                      color: 'text.secondary',
                                      textAlign: 'center',
                                      lineHeight: 1.2,
                                      maxWidth: '100px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {team.name}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography
                                  color="text.disabled"
                                  fontSize={isMobile ? '0.75rem' : '1rem'}
                                >
                                  -
                                </Typography>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* Side Panel for Team Selection */}
      <Drawer
        anchor="right"
        open={!!selectedSlot}
        onClose={() => {
          setSelectedSlot(null);
          setSecondSlot(null);
        }}
        variant="persistent"
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? '90%' : 400,
            boxSizing: 'border-box',
            p: 3
          }
        }}
      >
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
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
          <IconButton
            onClick={() => {
              setSelectedSlot(null);
              setSecondSlot(null);
            }}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {selectedSlot && (
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Divider />

            {/* Show all scheduled events for this team */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {t('field-matches')}
              </Typography>
              <Stack spacing={1}>
                {division.field.matches
                  .filter(match =>
                    match.participants.some(p => p.team?.id === selectedSlot?.team?.id)
                  )
                  .map(match => {
                    const participant = match.participants.find(
                      p => p.team?.id === selectedSlot?.team?.id
                    );
                    return (
                      <Paper key={match.id} sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {getStage(match.stage)} #{match.number}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {participant?.table.name} •{' '}
                              {dayjs(match.scheduledTime).format('HH:mm')}
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
                  .filter(session => session.team?.id === selectedSlot.team?.id)
                  .map(session => (
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
                  <Button variant="contained" color="primary" fullWidth onClick={handleMove}>
                    {t('move-team')}
                  </Button>
                  <Button variant="contained" color="secondary" fullWidth onClick={handleReplace}>
                    {t('replace-team')}
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setSelectedSlot(null);
                      setSecondSlot(null);
                    }}
                  >
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
    </Paper>
  );
}

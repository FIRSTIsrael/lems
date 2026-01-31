'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import dayjs from 'dayjs';
import { useMatchTranslations } from '@lems/localization';
import type { TournamentManagerData } from '../graphql';

interface ScheduleReferenceProps {
  division: TournamentManagerData['division'];
}

export function ScheduleReference({ division }: ScheduleReferenceProps) {
  const t = useTranslations('pages.tournament-manager');
  const { getStage } = useMatchTranslations();
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
                <TableContainer key={key} component={Paper} sx={{ p: 0, bgcolor: 'white', mb: 3 }}>
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
                                  {team ? (
                                    <Tooltip title={team.name} arrow>
                                      <Box
                                        sx={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 0.5,
                                          cursor: 'default'
                                        }}
                                      >
                                        <Typography
                                          component="span"
                                          sx={{
                                            fontSize: isMobile ? '0.75rem' : '1rem'
                                          }}
                                        >
                                          #{team.number}
                                        </Typography>
                                      </Box>
                                    </Tooltip>
                                  ) : (
                                    <Typography fontSize={isMobile ? '0.75rem' : '1rem'}>
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
                  const sessionEndTime = sessionTime.add(division.judging.sessionLength, 'seconds');
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
                              <Tooltip title={team.name} arrow>
                                <Box
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    cursor: 'default'
                                  }}
                                >
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontSize: isMobile ? '0.75rem' : '1rem'
                                    }}
                                  >
                                    #{team.number}
                                  </Typography>
                                </Box>
                              </Tooltip>
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
    </Paper>
  );
}

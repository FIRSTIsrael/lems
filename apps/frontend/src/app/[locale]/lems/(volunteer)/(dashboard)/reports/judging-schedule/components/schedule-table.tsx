'use client';

import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  TableBody,
  Paper,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
  Box
} from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import { Room, ScheduleRow } from '../graphql';
import { useTime } from '../../../../../../../../lib/time/hooks';

const JUDGING_SESSION_LENGTH = 15 * 60;

interface ScheduleTableProps {
  rooms: Room[];
  rows: ScheduleRow[];
}

const VISIBILITY_COLORS: Record<string, string> = {
  public: '#4CAF50',
  judging: '#FF9800'
};

export function ScheduleTable({ rooms, rows }: ScheduleTableProps) {
  const t = useTranslations('pages.reports.judging-schedule');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Use time hook with test date for development
  const currentTime = useTime({ interval: 60000 });
  const testTime = dayjs().year(2025).month(11).date(29).hour(8).minute(0).second(0);
  const effectiveCurrentTime = testTime; // Use test time for development

  console.log('Current time hook:', currentTime.format());

  const roomCount = rooms.length;

  return (
    <Paper sx={{ p: 0, bgcolor: 'white' }}>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table
          size="small"
          sx={{
            tableLayout: 'fixed',
            width: '100%',
            minWidth: Math.max(400, 100 + roomCount * 100)
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell width={80} align="center">
                <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                  {t('table.start-time')}
                </Typography>
              </TableCell>
              <TableCell width={80} align="center">
                <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                  {t('table.end-time')}
                </Typography>
              </TableCell>
              {rooms.map(room => (
                <TableCell key={room.id} align="center">
                  <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                    {room.name}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              if (row.type === 'agenda' && row.agendaEvent) {
                const event = row.agendaEvent;
                const visibilityColor = VISIBILITY_COLORS[event.visibility] || '#9E9E9E';
                const startTime = dayjs(row.time);
                const endTime = startTime.add(event.duration, 'second');
                const isActive =
                  effectiveCurrentTime.isAfter(startTime) && effectiveCurrentTime.isBefore(endTime);

                return (
                  <TableRow
                    key={`agenda-${event.id}`}
                    sx={{
                      bgcolor: isActive ? `${visibilityColor}10` : 'white',
                      borderLeft: `4px solid ${visibilityColor}`
                    }}
                  >
                    <TableCell align="center">
                      <Typography
                        fontFamily="monospace"
                        fontWeight={500}
                        fontSize={isMobile ? '0.75rem' : '1rem'}
                      >
                        {dayjs(row.time).format('HH:mm')}
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
                    <TableCell colSpan={roomCount} align="center">
                      <Typography
                        component="div"
                        fontWeight={500}
                        fontSize={isMobile ? '0.75rem' : '1rem'}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1
                        }}
                      >
                        {event.title}
                        <Chip
                          size="small"
                          label={t(`visibility.${event.visibility}`)}
                          sx={{
                            ml: 1,
                            height: 20,
                            fontSize: '0.7rem',
                            backgroundColor: `${visibilityColor}20`,
                            color: visibilityColor,
                            fontWeight: 500
                          }}
                        />
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              }

              const sessionTime = dayjs(row.time);
              const sessionEndTime = sessionTime.add(JUDGING_SESSION_LENGTH, 'seconds');

              const allSessionsCompleted =
                row.rooms?.every(room => {
                  // Find the session for this room and time from the original sessions data
                  // This is a simplified check - in practice you'd need access to session status
                  return room.team; // For now, assume sessions with teams might be completed
                }) || false;

              return (
                <TableRow
                  key={`session-${index}`}
                  sx={{
                    bgcolor: allSessionsCompleted ? 'grey.100' : 'white'
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
                  {row.rooms?.map(room => (
                    <TableCell key={room.id} align="center">
                      {room.team ? (
                        <Tooltip
                          title={`${room.team.name} ${room.team.arrived ? '' : `(${t('not-arrived')})`}`}
                          arrow
                        >
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              cursor: 'default'
                            }}
                          >
                            {!room.team.arrived && (
                              <BlockIcon
                                sx={{
                                  fontSize: isMobile ? 14 : 16,
                                  color: 'error.main'
                                }}
                              />
                            )}
                            <Typography
                              component="span"
                              sx={{
                                fontSize: isMobile ? '0.75rem' : '1rem'
                              }}
                            >
                              #{room.team.number}
                            </Typography>
                          </Box>
                        </Tooltip>
                      ) : (
                        <Typography color="text.disabled" fontSize={isMobile ? '0.75rem' : '1rem'}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

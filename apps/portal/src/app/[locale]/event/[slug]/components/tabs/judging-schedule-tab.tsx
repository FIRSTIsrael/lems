'use client';

import { useParams } from 'next/navigation';
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
  Box,
  Link,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import NextLink from 'next/link';
import { JudgingSession } from '@lems/types/api/portal';
import { useRealtimeData } from '../../../../hooks/use-realtime-data';
import { groupSessionsByTime } from '../utils';
import { useDivision } from '../division-data-context';

export const JudgingScheduleTab = () => {
  const t = useTranslations('pages.event');

  const params = useParams();
  const eventSlug = params.slug as string;

  const division = useDivision();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: sessions } = useRealtimeData<JudgingSession[]>(
    `/portal/divisions/${division.id}/schedule/judging`,
    { suspense: true }
  );

  if (!sessions) {
    return null; // Should be handled by suspense fallback
  }

  // Extract unique rooms from all sessions
  const roomsMap = new Map<string, { id: string; name: string }>();
  sessions.forEach(session => {
    roomsMap.set(session.room.id, session.room);
  });
  const rooms = Array.from(roomsMap.values());

  const groupedSessions = groupSessionsByTime(sessions, rooms);

  return (
    <Paper sx={{ p: 0 }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography variant="h2" gutterBottom>
          {t('quick-links.judging-schedule')}
        </Typography>
      </Box>

      {groupedSessions.length > 0 && (
        <Paper sx={{ p: 0, mt: 2, bgcolor: 'white' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table
              size="small"
              sx={{
                tableLayout: 'fixed',
                width: '100%',
                minWidth: 800
              }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell width={80} align="center">
                    <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                      {t('judging-schedule.start-time')}
                    </Typography>
                  </TableCell>
                  {rooms.map(room => (
                    <TableCell key={room.id} width={80} align="center">
                      <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                        {room.name}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedSessions.map((session, sessionIndex) => (
                  <TableRow key={sessionIndex} sx={{ bgcolor: 'white' }}>
                    <TableCell align="center">
                      <Typography
                        fontFamily="monospace"
                        fontWeight={500}
                        fontSize={isMobile ? '0.75rem' : '1rem'}
                      >
                        {dayjs(session.time).format('HH:mm')}
                      </Typography>
                    </TableCell>
                    {session.rooms.map(room => {
                      const team = room.team;
                      return (
                        <TableCell key={room.id} align="center">
                          {team ? (
                            <Tooltip title={team.name} arrow>
                              <Link
                                component={NextLink}
                                href={`/event/${eventSlug}/team/${team.slug}`}
                                sx={{
                                  color: 'black',
                                  textDecoration: 'none',
                                  fontSize: isMobile ? '0.75rem' : '1rem',
                                  '&:hover': {
                                    textDecoration: 'underline',
                                    color: 'primary.main'
                                  }
                                }}
                              >
                                #{team.number}
                              </Link>
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {groupedSessions.length === 0 && (
        <Box display="flex" alignItems="center" justifyContent="center" py={4} sx={{ px: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {t('judging-schedule.no-data')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

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
  Box,
  Link,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import NextLink from 'next/link';

interface JudgingSession {
  startTime: string;
  endTime: string;
  teams: {
    room1?: { number: number; name: string };
    room2?: { number: number; name: string };
    room3?: { number: number; name: string };
    room4?: { number: number; name: string };
  };
}

interface DivisionJudgingScheduleProps {
  sessions: JudgingSession[];
  eventSlug: string;
}

export const DivisionJudgingSchedule: React.FC<DivisionJudgingScheduleProps> = ({ sessions }) => {
  const t = useTranslations('pages.event');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const rooms = ['room1', 'room2', 'room3', 'room4'];

  return (
    <Paper sx={{ p: 0 }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography variant="h2" gutterBottom>
          {t('quick-links.judging-schedule')}
        </Typography>
      </Box>

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
                <TableCell width={80} align="center">
                  <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                    {t('judging-schedule.end-time')}
                  </Typography>
                </TableCell>
                {rooms.map((_, index) => (
                  <TableCell key={index} width={80} align="center">
                    <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                      {t('judging-schedule.room')} {index + 1}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session, sessionIndex) => (
                <TableRow key={sessionIndex} sx={{ bgcolor: 'white' }}>
                  <TableCell align="center">
                    <Typography
                      fontFamily="monospace"
                      fontWeight={500}
                      fontSize={isMobile ? '0.75rem' : '1rem'}
                    >
                      {dayjs(session.startTime).format('HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      fontFamily="monospace"
                      fontWeight={500}
                      fontSize={isMobile ? '0.75rem' : '1rem'}
                    >
                      {dayjs(session.endTime).format('HH:mm')}
                    </Typography>
                  </TableCell>
                  {rooms.map(roomKey => {
                    const team = session.teams[roomKey as keyof typeof session.teams];
                    return (
                      <TableCell key={roomKey} align="center">
                        {team ? (
                          <Tooltip title={team.name} arrow>
                            <Link
                              component={NextLink}
                              href={`/teams/${team.number}`}
                              sx={{
                                color: 'black',
                                textDecoration: 'none',
                                fontWeight: 500,
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

      {sessions.length === 0 && (
        <Box display="flex" alignItems="center" justifyContent="center" py={4} sx={{ px: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {t('judging-schedule.no-data')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

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
  Tooltip
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

interface JudgingScheduleProps {
  sessions: JudgingSession[];
  eventSlug: string;
}

const JudgingSchedule: React.FC<JudgingScheduleProps> = ({ sessions }) => {
  const t = useTranslations('pages.event');

  const rooms = ['room1', 'room2', 'room3', 'room4'];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('quick-links.judging-schedule')}
      </Typography>
      
      <Paper sx={{ p: 2, mt: 2, bgcolor: 'white' }}>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'grey.200', color: 'black', width: '120px', fontWeight: 'bold', textAlign: 'center', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', borderLeft: 'none', borderRight: 'none' }}>
                  <Typography fontWeight={600}>{t('judging-schedule.start-time')}</Typography>
                </TableCell>
                <TableCell sx={{ bgcolor: 'grey.200', color: 'black', width: '120px', fontWeight: 'bold', textAlign: 'center', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', borderLeft: 'none', borderRight: 'none' }}>
                  <Typography fontWeight={600}>{t('judging-schedule.end-time')}</Typography>
                </TableCell>
                {rooms.map((_, index) => (
                  <TableCell key={index} sx={{ bgcolor: 'grey.200', color: 'black', minWidth: '120px', fontWeight: 'bold', textAlign: 'center', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', borderLeft: 'none', borderRight: 'none' }}>
                    <Typography fontWeight={600}>
                      {t('judging-schedule.room')} {index + 1}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session, sessionIndex) => (
                <TableRow
                  key={sessionIndex}
                  sx={{ 
                    bgcolor: 'white',
                    '& td': sessionIndex === 0 ? { 
                      bgcolor: 'white !important',
                      borderTop: '3px solid white'
                    } : {}
                  }}
                >
                  <TableCell sx={{ textAlign: 'center', borderTop: sessionIndex === 0 ? '2px solid #ddd' : 'none', borderBottom: '1px solid #ddd', borderLeft: 'none', borderRight: 'none', py: 1.5 }}>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                      {dayjs(session.startTime).format('HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', borderTop: sessionIndex === 0 ? '2px solid #ddd' : 'none', borderBottom: '1px solid #ddd', borderLeft: 'none', borderRight: 'none', py: 1.5 }}>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                      {dayjs(session.endTime).format('HH:mm')}
                    </Typography>
                  </TableCell>
                  {rooms.map(roomKey => {
                    const team = session.teams[roomKey as keyof typeof session.teams];
                    return (
                      <TableCell key={roomKey} sx={{ textAlign: 'center', borderTop: sessionIndex === 0 ? '2px solid #ddd' : 'none', borderBottom: '1px solid #ddd', borderLeft: 'none', borderRight: 'none', py: 1.5 }}>
                        {team ? (
                          <Tooltip title={team.name} arrow>
                            <Link
                              component={NextLink}
                              href={`/teams/${team.number}`}
                              sx={{
                                color: 'black',
                                textDecoration: 'none',
                                fontWeight: 500,
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
                          <Typography color="text.disabled">-</Typography>
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
        <Box display="flex" alignItems="center" justifyContent="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            {t('judging-schedule.no-data')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default JudgingSchedule;

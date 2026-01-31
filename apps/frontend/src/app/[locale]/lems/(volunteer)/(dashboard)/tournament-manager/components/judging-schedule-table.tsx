import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import type { TournamentManagerData } from '../graphql';
import { TeamSlot } from './team-slot';
import type { SlotInfo } from './types';

interface JudgingScheduleTableProps {
  sessions: TournamentManagerData['division']['judging']['sessions'];
  sessionLength: number;
  rooms: { id: string; name: string }[];
  selectedSlot: SlotInfo | null;
  secondSlot: SlotInfo | null;
  isMobile: boolean;
  onSlotClick: (slot: SlotInfo) => void;
  t: (key: string) => string;
}

export function JudgingScheduleTable({
  sessions,
  sessionLength,
  rooms,
  selectedSlot,
  secondSlot,
  isMobile,
  onSlotClick,
  t
}: JudgingScheduleTableProps) {
  const groupedSessions = sessions.reduce(
    (acc, session) => {
      const timeKey = dayjs(session.scheduledTime).format('HH:mm');
      if (!acc[timeKey]) {
        acc[timeKey] = { time: session.scheduledTime, sessions: [] };
      }
      acc[timeKey].sessions.push(session);
      return acc;
    },
    {} as Record<string, { time: string; sessions: typeof sessions }>
  );

  const sessionRows = Object.values(groupedSessions).sort((a, b) =>
    dayjs(a.time).diff(dayjs(b.time))
  );

  return (
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
          {sessionRows.map((row, index) => {
            const sessionTime = dayjs(row.time);
            const sessionEndTime = sessionTime.add(sessionLength, 'seconds');

            const roomSessions = new Map(row.sessions.map(s => [s.room.id, s]));

            return (
              <TableRow key={index}>
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
                {rooms.map(room => {
                  const session = roomSessions.get(room.id);
                  const team = session?.team;

                  return (
                    <TableCell key={room.id} align="center">
                      <TeamSlot
                        team={team || null}
                        isSelected={selectedSlot?.sessionId === session?.id}
                        isSecondSelected={secondSlot?.sessionId === session?.id}
                        isMobile={isMobile}
                        onClick={() => {
                          const slot = {
                            type: 'session' as const,
                            sessionId: session?.id,
                            team: team || null,
                            roomName: room.name,
                            time: sessionTime.format('HH:mm')
                          };
                          onSlotClick(slot);
                        }}
                      />
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
}

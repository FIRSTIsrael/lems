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
import { useMemo, memo } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import type { TournamentManagerData } from '../../graphql';
import { TeamSlot } from '../team-slot';
import type { SlotInfo } from '../types';
import { SourceType } from '../types';
import {
  isSlotBlockedForSelection,
  isSlotBlockedAsDestination,
  isValidDestination
} from '../validation';

interface JudgingScheduleTableProps {
  sessions: TournamentManagerData['division']['judging']['sessions'];
  sessionLength: number;
  rooms: { id: string; name: string }[];
  selectedSlot: SlotInfo | null;
  sourceType: SourceType | null;
  secondSlot: SlotInfo | null;
  isMobile: boolean;
  division?: TournamentManagerData['division'];
  onSlotClick: (slot: SlotInfo) => void;
}

const groupSessionsByTime = (
  sessions: TournamentManagerData['division']['judging']['sessions']
) => {
  const grouped: Record<string, { time: string; sessions: typeof sessions }> = {};
  sessions.forEach(session => {
    const timeKey = dayjs(session.scheduledTime).format('HH:mm');
    if (!grouped[timeKey]) {
      grouped[timeKey] = { time: session.scheduledTime, sessions: [] };
    }
    grouped[timeKey].sessions.push(session);
  });

  return Object.values(grouped).sort((a, b) => dayjs(a.time).diff(dayjs(b.time)));
};

function JudgingScheduleTableComponent({
  sessions,
  sessionLength,
  rooms,
  selectedSlot,
  sourceType,
  secondSlot,
  isMobile,
  division,
  onSlotClick
}: JudgingScheduleTableProps) {
  const t = useTranslations('pages.tournament-manager');
  const sessionRows = useMemo(() => groupSessionsByTime(sessions), [sessions]);

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
                {t('judging-schedule.columns.start-time')}
              </Typography>
            </TableCell>
            <TableCell width={80} align="center">
              <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                {t('judging-schedule.columns.end-time')}
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
                  const slot: SlotInfo = {
                    type: 'session',
                    sessionId: session?.id,
                    team: team ?? null,
                    roomName: room.name,
                    time: sessionTime.format('HH:mm')
                  };

                  const isCurrentSlot = selectedSlot?.sessionId === session?.id;
                  const isDisabled =
                    // Never disable the selected source slot
                    !isCurrentSlot && // Disable empty slots when looking for a source
                    ((!selectedSlot && !team) ||
                      // Disable invalid destinations when source is selected
                      (selectedSlot &&
                        division &&
                        !isValidDestination(slot, sourceType, division)) ||
                      // Disable blocked slots based on selection state
                      (team !== null && division
                        ? isSlotBlockedForSelection(slot, division) ||
                          (secondSlot ? isSlotBlockedAsDestination(slot, division) : false)
                        : false));

                  return (
                    <TableCell key={room.id} align="center">
                      <TeamSlot
                        team={team ?? null}
                        isSelected={isCurrentSlot}
                        isSecondSelected={secondSlot?.sessionId === session?.id}
                        isMobile={isMobile}
                        isDisabled={isDisabled}
                        onClick={() => onSlotClick(slot)}
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

export const JudgingScheduleTable = memo(JudgingScheduleTableComponent);

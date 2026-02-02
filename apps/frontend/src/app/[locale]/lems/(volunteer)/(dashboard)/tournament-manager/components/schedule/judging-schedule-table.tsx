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
import { useMemo, memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import type { SessionStatus } from '../../graphql';
import { TeamSlot } from '../team-slot';
import { StatusChip } from '../status-chip';
import type { SlotInfo } from '../types';
import { useTournamentManager } from '../../context';
import { useSlotOperations } from '../../hooks/useSlotOperations';
import { isSlotDisabled } from '../validation';

interface JudgingScheduleTableProps {
  isMobile: boolean;
}

function JudgingScheduleTableComponent({ isMobile }: JudgingScheduleTableProps) {
  const t = useTranslations('pages.tournament-manager');
  const { division, selectedSlot, sourceType, secondSlot, dispatch } = useTournamentManager();
  const { handleSlotClick: handleSlotClickOperation } = useSlotOperations(division, dispatch);

  const sessions = division.judging.sessions;
  const rooms = division.rooms ?? [];
  const sessionLength = division.judging.sessionLength;

  const sessionRows = useMemo(() => {
    const grouped: Record<string, { time: string; sessions: typeof sessions }> = {};
    sessions.forEach(session => {
      const timeKey = dayjs(session.scheduledTime).format('HH:mm');
      if (!grouped[timeKey]) {
        grouped[timeKey] = { time: session.scheduledTime, sessions: [] };
      }
      grouped[timeKey].sessions.push(session);
    });
    return Object.values(grouped).sort((a, b) => dayjs(a.time).diff(dayjs(b.time)));
  }, [sessions]);

  const handleSlotClick = useCallback(
    (slot: SlotInfo) => {
      handleSlotClickOperation(slot, selectedSlot, sourceType);
    },
    [handleSlotClickOperation, selectedSlot, sourceType]
  );

  const headerFontSize = isMobile ? '0.75rem' : '1rem';
  const cellFontSize = isMobile ? '0.75rem' : '1rem';

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
              <Typography fontWeight={600} fontSize={headerFontSize}>
                {t('judging-schedule.columns.start-time')}
              </Typography>
            </TableCell>
            <TableCell width={80} align="center">
              <Typography fontWeight={600} fontSize={headerFontSize}>
                {t('judging-schedule.columns.end-time')}
              </Typography>
            </TableCell>
            <TableCell width={120} align="center">
              <Typography fontWeight={600} fontSize={headerFontSize}>
                {t('judging-schedule.columns.status')}
              </Typography>
            </TableCell>
            {rooms.map(room => (
              <TableCell key={room.id} align="center">
                <Typography fontWeight={600} fontSize={headerFontSize}>
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
            const firstSession = row.sessions[0];
            const firstSessionStatus = firstSession?.status ?? 'not-started';

            return (
              <TableRow key={index}>
                <TableCell align="center">
                  <Typography fontFamily="monospace" fontWeight={500} fontSize={cellFontSize}>
                    {sessionTime.format('HH:mm')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography fontFamily="monospace" fontWeight={500} fontSize={cellFontSize}>
                    {sessionEndTime.format('HH:mm')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <StatusChip
                    type="session"
                    status={firstSessionStatus as SessionStatus}
                    size="small"
                  />
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
                  const disabled = isSlotDisabled(
                    slot,
                    selectedSlot,
                    sourceType,
                    secondSlot,
                    division
                  );

                  return (
                    <TableCell key={room.id} align="center">
                      <TeamSlot
                        team={team ?? null}
                        isSelected={isCurrentSlot}
                        isSecondSelected={secondSlot?.sessionId === session?.id}
                        isMobile={isMobile}
                        isDisabled={disabled}
                        onClick={() => handleSlotClick(slot)}
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

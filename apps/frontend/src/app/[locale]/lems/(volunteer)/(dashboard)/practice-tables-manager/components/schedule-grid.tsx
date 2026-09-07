'use client';

import { useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Box
} from '@mui/material';
import { Add as AddIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation?: string;
}

interface BlockedTimeSlot {
  start: string;
  end: string;
  reason?: string;
}

interface ScheduleGridProps {
  tableCount: number;
  slotDurationMinutes: number;
  blockedTimeSlots: BlockedTimeSlot[];
  startTime?: string;
  endTime?: string;
  selectedCell: { tableIndex: number; time: string } | null;
  onCellSelect: (tableIndex: number, time: string) => void;
  assignments: Record<string, Record<string, Team>>;
  onClearAssignment: (tableIndex: number, time: string) => void;
}

export function ScheduleGrid({
  tableCount,
  slotDurationMinutes,
  blockedTimeSlots,
  startTime = '07:00',
  endTime = '19:00',
  selectedCell,
  onCellSelect,
  assignments,
  onClearAssignment
}: ScheduleGridProps) {
  const t = useTranslations('pages.practice-tables-manager.schedule');

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDurationMinutes) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }

    return slots;
  }, [slotDurationMinutes, startTime, endTime]);

  const isTimeBlocked = (time: string) => {
    return blockedTimeSlots.some(blocked => time >= blocked.start && time < blocked.end);
  };

  // Get the blocked slot info for a time, including rowSpan
  const getBlockedSlotInfo = (time: string) => {
    const blockedSlot = blockedTimeSlots.find(b => time >= b.start && time < b.end);
    if (!blockedSlot) return null;

    // Calculate how many time slots this blocked period spans
    const slotsInRange = timeSlots.filter(
      slot => slot >= blockedSlot.start && slot < blockedSlot.end
    );

    // Check if this is the first slot in the blocked range
    const isFirstSlot = time === slotsInRange[0];

    return {
      reason: blockedSlot.reason,
      rowSpan: slotsInRange.length,
      isFirstSlot
    };
  };

  const isCellSelected = (tableIndex: number, time: string) => {
    return selectedCell?.tableIndex === tableIndex && selectedCell?.time === time;
  };

  const handleClearClick = (tableIndex: number, time: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onClearAssignment(tableIndex, time);
  };

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>{t('time')}</TableCell>
            {Array.from({ length: tableCount }, (_, i) => (
              <TableCell key={i} align="center" sx={{ fontWeight: 'bold', minWidth: 120 }}>
                {t('table')} {i + 1}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {timeSlots.map(time => {
            const blocked = isTimeBlocked(time);

            const blockedInfo = blocked ? getBlockedSlotInfo(time) : null;
            const isFirstBlockedSlot = blockedInfo?.isFirstSlot || false;

            return (
              <TableRow
                key={time}
                sx={{ '&:hover': { bgcolor: blocked ? undefined : 'action.hover' } }}
              >
                <TableCell
                  sx={{
                    fontWeight: 'medium',
                    bgcolor: blocked ? 'action.disabledBackground' : undefined,
                    color: blocked ? 'text.disabled' : undefined
                  }}
                >
                  {time}
                </TableCell>
                {Array.from({ length: tableCount }, (_, tableIndex) => {
                  const assignment = assignments[tableIndex]?.[time];
                  const isSelected = isCellSelected(tableIndex, time);

                  if (blocked && blockedInfo) {
                    // Only render the merged cell on the first table column and first time slot of the blocked range
                    if (tableIndex === 0 && isFirstBlockedSlot) {
                      return (
                        <TableCell
                          key={tableIndex}
                          colSpan={tableCount}
                          rowSpan={blockedInfo.rowSpan}
                          align="center"
                          sx={{
                            bgcolor: 'action.disabledBackground',
                            color: 'text.primary'
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            {blockedInfo.reason || t('unavailable')}
                          </Typography>
                        </TableCell>
                      );
                    }
                    // Skip all other cells in the blocked range
                    return null;
                  }

                  return (
                    <TableCell
                      key={tableIndex}
                      align="center"
                      onClick={() => onCellSelect(tableIndex, time)}
                      sx={{
                        cursor: 'pointer',
                        position: 'relative',
                        bgcolor: isSelected ? 'primary.light' : undefined,
                        '&:hover': {
                          bgcolor: isSelected ? 'primary.light' : 'action.hover'
                        }
                      }}
                    >
                      {assignment ? (
                        <Box>
                          <Chip
                            label={`#${assignment.number}`}
                            size="small"
                            onDelete={e => handleClearClick(tableIndex, time, e)}
                            deleteIcon={<ClearIcon />}
                            color="primary"
                            sx={{ mb: 0.5 }}
                          />
                          <Typography variant="caption" sx={{ display: 'block' }} color="#000000">
                            {assignment.name}
                          </Typography>
                        </Box>
                      ) : (
                        <IconButton size="small" sx={{ opacity: isSelected ? 0.8 : 0.3 }}>
                          <AddIcon fontSize="small" />
                        </IconButton>
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
}

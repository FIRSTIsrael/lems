'use client';

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
import { formatTimeOnly } from '@lems/shared/utils';
import { usePracticeTablesSchedule } from '../../hooks/usePracticeTablesSchedule';

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
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  selectedCell: { tableIndex: number; time: string } | null;
  onCellSelect: (tableIndex: number, time: string) => void;
  assignments: Record<string, Record<string, Team>>;
  onClearAssignment: (tableIndex: number, time: string) => void;
}

export function ScheduleGrid({
  tableCount,
  slotDurationMinutes,
  blockedTimeSlots,
  startTime,
  endTime,
  selectedCell,
  onCellSelect,
  assignments,
  onClearAssignment
}: ScheduleGridProps) {
  const t = useTranslations('pages.practice-tables-manager.schedule');

  // Use shared hook to manage schedule logic
  const { timeSlots, isBlocked, getBlockedSlotInfo } = usePracticeTablesSchedule(
    {
      divisionId: '', // Not needed for this use case
      tableCount,
      slotDurationMinutes,
      startTime,
      endTime,
      blockedTimeSlots
    },
    [] // No assignments needed - we get them from props
  );

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
            const blocked = isBlocked(time);
            const displayTime = formatTimeOnly(time);

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
                  {displayTime}
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

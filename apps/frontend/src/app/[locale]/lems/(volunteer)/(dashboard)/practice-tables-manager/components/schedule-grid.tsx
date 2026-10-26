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
import { formatTimeOnly, TABLE_SIDES, type TableSide } from '@lems/shared/utils';
import { usePracticeTablesSchedule, positionKey } from '../hooks/use-practice-tables-schedule';

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
  selectedCell: { tableIndex: number; side: TableSide | null; time: string } | null;
  onCellSelect: (tableIndex: number, side: TableSide | null, time: string) => void;
  assignments: Record<string, Record<string, Team>>;
  onClearAssignment: (tableIndex: number, side: TableSide | null, time: string) => void;
  paired: boolean;
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
  onClearAssignment,
  paired
}: ScheduleGridProps) {
  const t = useTranslations('pages.practice-tables-manager.schedule');

  // Use shared hook to manage schedule logic
  const { timeSlots, positions, isBlocked, getBlockedSlotInfo } = usePracticeTablesSchedule(
    {
      divisionId: '', // Not needed for this use case
      tableCount,
      slotDurationMinutes,
      startTime,
      endTime,
      blockedTimeSlots
    },
    [], // No assignments needed - we get them from props
    paired
  );

  const isCellSelected = (tableIndex: number, side: TableSide | null, time: string) => {
    return (
      selectedCell?.tableIndex === tableIndex &&
      selectedCell?.side === side &&
      selectedCell?.time === time
    );
  };

  const handleClearClick = (
    tableIndex: number,
    side: TableSide | null,
    time: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    onClearAssignment(tableIndex, side, time);
  };

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell rowSpan={paired ? 2 : 1} sx={{ fontWeight: 'bold', minWidth: 80 }}>
              {t('time')}
            </TableCell>
            {Array.from({ length: tableCount }, (_, i) => (
              <TableCell
                key={i}
                align="center"
                colSpan={paired ? TABLE_SIDES.length : 1}
                sx={{ fontWeight: 'bold', minWidth: 120 }}
              >
                {t('table')} {i + 1}
              </TableCell>
            ))}
          </TableRow>
          {paired && (
            <TableRow>
              {positions.map(({ tableIndex, side }) => (
                <TableCell
                  key={positionKey(tableIndex, side)}
                  align="center"
                  title={t('side', { side: side ?? '' })}
                  sx={{ fontWeight: 'bold', top: 37 }}
                >
                  {side}
                </TableCell>
              ))}
            </TableRow>
          )}
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
                {positions.map(({ tableIndex, side }, positionIndex) => {
                  const key = positionKey(tableIndex, side);
                  const assignment = assignments[key]?.[time];
                  const isSelected = isCellSelected(tableIndex, side, time);

                  if (blocked && blockedInfo) {
                    // Only render the merged cell on the first position column and first time slot of the blocked range
                    if (positionIndex === 0 && isFirstBlockedSlot) {
                      return (
                        <TableCell
                          key={key}
                          colSpan={positions.length}
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
                      key={key}
                      align="center"
                      onClick={() => onCellSelect(tableIndex, side, time)}
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
                            onDelete={e => handleClearClick(tableIndex, side, time, e)}
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

import { useTranslations } from 'next-intl';
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
  Box
} from '@mui/material';
import { formatTimeOnly } from '@lems/shared/utils';
import { usePracticeTablesSchedule } from '../../../hooks/usePracticeTablesSchedule';

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation: string;
}

interface PracticeTableAssignment {
  id: string;
  tableIndex: number;
  startTime: string;
  endTime: string;
  team: Team;
}

interface BlockedTimeSlot {
  start: string;
  end: string;
  reason?: string;
}

interface PracticeTablesConfig {
  divisionId: string;
  tableCount: number;
  slotDurationMinutes: number;
  startTime: string;
  endTime: string;
  blockedTimeSlots: BlockedTimeSlot[];
}

interface Props {
  config: PracticeTablesConfig;
  assignments: PracticeTableAssignment[];
}

export const PracticeTablesSchedule: React.FC<Props> = ({ config, assignments }) => {
  const t = useTranslations('pages.reports.practice-tables');

  // Use hook to manage schedule data and operations
  const { timeSlots, isBlocked, getBlockedSlotInfo, getAssignment } = usePracticeTablesSchedule(
    config,
    assignments
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: '80vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>{t('time')}</TableCell>
              {Array.from({ length: config.tableCount }, (_, i) => (
                <TableCell key={i} align="center" sx={{ fontWeight: 'bold', minWidth: 120 }}>
                  {t('table', { number: i + 1 })}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map(time => {
              const blocked = isBlocked(time);
              const blockedInfo = blocked ? getBlockedSlotInfo(time) : null;
              const isFirstBlockedSlot = blockedInfo?.isFirstSlot || false;

              return (
                <TableRow key={time}>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      bgcolor: blocked ? 'action.disabledBackground' : undefined,
                      color: blocked ? 'text.disabled' : undefined
                    }}
                  >
                    {formatTimeOnly(time)}
                  </TableCell>
                  {Array.from({ length: config.tableCount }, (_, tableIndex) => {
                    const assignment = getAssignment(tableIndex, time);

                    if (blocked && blockedInfo) {
                      // Only render the merged cell on the first table column and first time slot of the blocked range
                      if (tableIndex === 0 && isFirstBlockedSlot) {
                        return (
                          <TableCell
                            key={tableIndex}
                            colSpan={config.tableCount}
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

                    if (assignment) {
                      return (
                        <TableCell key={tableIndex} align="center">
                          <Box>
                            <Chip
                              label={`#${assignment.number}`}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 500, mb: 0.5 }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ display: 'block' }}
                              color="text.secondary"
                            >
                              {assignment.name}
                            </Typography>
                          </Box>
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell key={tableIndex} align="center">
                        <Typography variant="caption" color="text.secondary">
                          {t('available')}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

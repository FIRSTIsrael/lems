'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  generatePracticeTableTimeSlots,
  isTimeSlotBlocked,
  formatTimeOnly,
  TABLE_SIDES,
  type TableSide
} from '@lems/shared/utils';
import { getEdition } from '@lems/shared/edition';
import { useRealtimeData } from '../../../../hooks/use-realtime-data';
import { useDivision } from '../division-data-context';

interface BlockedTimeSlot {
  start: string; // ISO 8601 datetime
  end: string; // ISO 8601 datetime
  reason?: string;
}

interface PracticeTablesConfig {
  divisionId: string;
  tableCount: number;
  slotDurationMinutes: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  blockedTimeSlots: BlockedTimeSlot[];
}

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation?: string;
  slug: string;
}

interface PracticeTableAssignment {
  id: string;
  team: Team;
  tableIndex: number;
  side?: TableSide | null;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
}

interface PracticeTablesData {
  config: PracticeTablesConfig;
  assignments: PracticeTableAssignment[];
}

export const PracticeTablesTab: React.FC = () => {
  const t = useTranslations('pages.event.practice-tables');
  const params = useParams();
  const eventSlug = params.slug as string;
  const division = useDivision();

  const { data, isLoading } = useRealtimeData<PracticeTablesData | null>(
    `/portal/divisions/${division.id}/practice-tables`
  );

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (!data) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">{t('not-configured')}</Alert>
      </Paper>
    );
  }

  const { config, assignments } = data;
  const paired = getEdition(division) === 'future';
  const positions = Array.from({ length: config.tableCount }, (_, tableIndex) =>
    (paired ? TABLE_SIDES : [null]).map(side => ({ tableIndex, side }))
  ).flat();

  // Generate time slots using shared utility
  const timeSlots = generatePracticeTableTimeSlots(
    config.startTime,
    config.endTime,
    config.slotDurationMinutes
  );

  // Check if a time slot is blocked
  const isTimeBlocked = (time: string) => {
    return config.blockedTimeSlots.some(blocked =>
      isTimeSlotBlocked(time, blocked.start, blocked.end)
    );
  };

  // Get the blocked slot info for a time, including rowSpan
  const getBlockedSlotInfo = (time: string) => {
    const blockedSlot = config.blockedTimeSlots.find(b => isTimeSlotBlocked(time, b.start, b.end));
    if (!blockedSlot) return null;

    // Calculate how many time slots this blocked period spans
    const slotsInRange = timeSlots.filter(slot =>
      isTimeSlotBlocked(slot, blockedSlot.start, blockedSlot.end)
    );

    // Check if this is the first slot in the blocked range
    const isFirstSlot = time === slotsInRange[0];

    return {
      reason: blockedSlot.reason,
      rowSpan: slotsInRange.length,
      isFirstSlot
    };
  };

  // Get assignment for a specific table, side and time
  const getAssignment = (tableIndex: number, time: string, side: TableSide | null) => {
    return assignments?.find(
      a => a.tableIndex === tableIndex && (a.side ?? null) === side && a.startTime === time
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('title')}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {t('description', {
            tables: config.tableCount,
            duration: config.slotDurationMinutes
          })}
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={paired ? 2 : 1} sx={{ fontWeight: 600, minWidth: 80 }}>
                {t('time')}
              </TableCell>
              {Array.from({ length: config.tableCount }, (_, i) => (
                <TableCell
                  key={i}
                  align="center"
                  colSpan={paired ? TABLE_SIDES.length : 1}
                  sx={{ fontWeight: 600, minWidth: 120 }}
                >
                  {t('table')} {i + 1}
                </TableCell>
              ))}
            </TableRow>
            {paired && (
              <TableRow>
                {positions.map(({ tableIndex, side }) => (
                  <TableCell
                    key={`${tableIndex}:${side}`}
                    align="center"
                    title={t('side', { side: side ?? '' })}
                    sx={{ fontWeight: 600 }}
                  >
                    {side}
                  </TableCell>
                ))}
              </TableRow>
            )}
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
                      fontWeight: 500,
                      bgcolor: blocked ? 'action.disabledBackground' : undefined,
                      color: blocked ? 'text.disabled' : undefined
                    }}
                  >
                    {formatTimeOnly(time)}
                  </TableCell>
                  {positions.map(({ tableIndex, side }, positionIndex) => {
                    const key = `${tableIndex}:${side ?? ''}`;
                    const assignment = getAssignment(tableIndex, time, side);

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

                    if (assignment) {
                      const href = `/event/${eventSlug}/team/${assignment.team.slug}`;

                      return (
                        <TableCell key={key} align="center" sx={{ p: 0 }}>
                          <Link
                            href={href}
                            style={{
                              textDecoration: 'none',
                              display: 'block',
                              padding: '16px'
                            }}
                          >
                            <Box>
                              <Chip
                                label={`#${assignment.team.number}`}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 500, mb: 0.5 }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  color: '#000000 !important'
                                }}
                              >
                                {assignment.team.name}
                              </Typography>
                            </Box>
                          </Link>
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell key={key} align="center">
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

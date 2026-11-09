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
import { formatTimeOnly, TABLE_SIDES } from '@lems/shared/utils';
import { useEdition } from '../../../../hooks/use-edition';
import {
  usePracticeTablesSchedule,
  positionKey
} from '../../../practice-tables-manager/hooks/use-practice-tables-schedule';
import type {
  PracticeTablesConfig,
  PracticeTableAssignment
} from '../../../practice-tables-manager/graphql/types';

interface Props {
  config: PracticeTablesConfig;
  assignments: PracticeTableAssignment[];
}

export const PracticeTablesSchedule: React.FC<Props> = ({ config, assignments }) => {
  const t = useTranslations('pages.reports.practice-tables');

  const paired = useEdition() === 'future';

  // Use hook to manage schedule data and operations
  const { timeSlots, positions, isBlocked, getBlockedSlotInfo, getAssignment } =
    usePracticeTablesSchedule(config, assignments, paired);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: '80vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={paired ? 2 : 1} sx={{ fontWeight: 'bold', minWidth: 80 }}>
                {t('time')}
              </TableCell>
              {Array.from({ length: config.tableCount }, (_, i) => (
                <TableCell
                  key={i}
                  align="center"
                  colSpan={paired ? TABLE_SIDES.length : 1}
                  sx={{ fontWeight: 'bold', minWidth: 120 }}
                >
                  {t('table', { number: i + 1 })}
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
                    sx={{ fontWeight: 'bold', top: 57 }}
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
                  {positions.map(({ tableIndex, side }, positionIndex) => {
                    const key = positionKey(tableIndex, side);
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
                      return (
                        <TableCell key={key} align="center">
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

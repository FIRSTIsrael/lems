import { useMemo } from 'react';
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

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation: string;
}

interface PracticeTableAssignment {
  id: string;
  tableNumber: number;
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

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const [startHour, startMin] = config.startTime.split(':').map(Number);
    const [endHour, endMin] = config.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    for (let minutes = startMinutes; minutes < endMinutes; minutes += config.slotDurationMinutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    }

    return slots;
  }, [config]);

  // Create assignments map
  const assignmentsMap = useMemo(() => {
    const map: Record<number, Record<string, Team>> = {};

    assignments.forEach(assignment => {
      const tableIndex = assignment.tableNumber - 1;
      if (!map[tableIndex]) {
        map[tableIndex] = {};
      }

      // Parse ISO timestamp and convert to HH:MM
      const startDate = new Date(assignment.startTime);
      const hours = startDate.getUTCHours().toString().padStart(2, '0');
      const minutes = startDate.getUTCMinutes().toString().padStart(2, '0');
      const timeKey = `${hours}:${minutes}`;

      map[tableIndex][timeKey] = assignment.team;
    });

    return map;
  }, [assignments]);

  // Check if a time slot is blocked
  const isBlocked = (time: string): boolean => {
    return config.blockedTimeSlots.some(slot => {
      return time >= slot.start && time < slot.end;
    });
  };

  const getAssignment = (tableIndex: number, time: string): Team | null => {
    return assignmentsMap[tableIndex]?.[time] || null;
  };

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

              return (
                <TableRow key={time}>
                  <TableCell sx={{ fontWeight: 500 }}>{time}</TableCell>
                  {Array.from({ length: config.tableCount }, (_, tableIndex) => {
                    const assignment = getAssignment(tableIndex, time);

                    if (blocked) {
                      return (
                        <TableCell
                          key={tableIndex}
                          align="center"
                          sx={{
                            bgcolor: 'error.light',
                            color: 'error.contrastText',
                            opacity: 0.6
                          }}
                        >
                          <Typography variant="caption">{t('blocked')}</Typography>
                        </TableCell>
                      );
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

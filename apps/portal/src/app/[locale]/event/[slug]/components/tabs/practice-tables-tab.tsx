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
import { useRealtimeData } from '../../../../hooks/use-realtime-data';
import { useDivision } from '../division-data-context';

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
  tableNumber: number;
  startTime: string;
  endTime: string;
}

export const PracticeTablesTab: React.FC = () => {
  const t = useTranslations('pages.event.practice-tables');
  const params = useParams();
  const eventSlug = params.slug as string;
  const division = useDivision();

  const { data: config, isLoading: configLoading } = useRealtimeData<PracticeTablesConfig>(
    `/portal/divisions/${division.id}/practice-tables-config`
  );

  const { data: assignments, isLoading: assignmentsLoading } = useRealtimeData<
    PracticeTableAssignment[]
  >(`/portal/divisions/${division.id}/practice-table-assignments`);

  if (configLoading || assignmentsLoading) {
    return (
      <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (!config) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">{t('not-configured')}</Alert>
      </Paper>
    );
  }

  // Generate time slots
  const timeSlots: string[] = [];
  const [startHour, startMinute] = config.startTime.split(':').map(Number);
  const [endHour, endMinute] = config.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  for (let minutes = startMinutes; minutes < endMinutes; minutes += config.slotDurationMinutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
  }

  // Check if a time slot is blocked
  const isTimeBlocked = (time: string) => {
    return config.blockedTimeSlots.some(blocked => time >= blocked.start && time < blocked.end);
  };

  // Get assignment for a specific table and time
  const getAssignment = (tableNumber: number, time: string) => {
    return assignments?.find(a => a.tableNumber === tableNumber && a.startTime === time);
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
              <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>{t('time')}</TableCell>
              {Array.from({ length: config.tableCount }, (_, i) => (
                <TableCell key={i} align="center" sx={{ fontWeight: 600, minWidth: 120 }}>
                  {t('table')} {i + 1}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map(time => {
              const blocked = isTimeBlocked(time);

              return (
                <TableRow key={time} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{time}</TableCell>
                  {Array.from({ length: config.tableCount }, (_, tableIndex) => {
                    const tableNumber = tableIndex + 1;
                    const assignment = getAssignment(tableNumber, time);

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
                      const href = `/event/${eventSlug}/team/${assignment.team.slug}`;

                      return (
                        <TableCell key={tableIndex} align="center" sx={{ p: 0 }}>
                          <Link
                            href={href}
                            style={{
                              textDecoration: 'none',
                              display: 'block',
                              padding: '16px'
                            }}
                          >
                            <Chip
                              label={`#${assignment.team.number}`}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 500 }}
                            />
                          </Link>
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

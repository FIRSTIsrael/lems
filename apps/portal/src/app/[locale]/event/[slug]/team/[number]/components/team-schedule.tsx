'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Typography, Stack, Box } from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';

interface ScheduleEntry {
  time: Date;
  type: string;
  location: string;
  isMatch: boolean;
}

interface Match {
  id: string;
  scheduledTime: Date;
  stage: string;
  number: number;
  participants: Array<{ teamId: string | null; tableId: string }>;
}

interface JudgingSession {
  id: string;
  scheduledTime: Date;
  number: number;
  teamId: string;
  roomId: string;
}

interface Table {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
}

interface TeamScheduleProps {
  teamMatches: Match[];
  teamJudging: JudgingSession[];
  tables: Table[];
  rooms: Room[];
  teamNumber: number;
}

const TeamSchedule: React.FC<TeamScheduleProps> = ({
  teamMatches,
  teamJudging,
  tables,
  rooms,
  teamNumber
}) => {
  const t = useTranslations('pages.team-in-event');

  const scheduleEntries: ScheduleEntry[] = [
    ...teamMatches.map(match => {
      const table = tables.find(t => match.participants.some(p => p.tableId === t.id));
      return {
        time: match.scheduledTime,
        type: t('schedule.match-type', {
          stage: match.stage,
          number: match.number,
          table: table?.name || '',
          teamNumber: teamNumber
        }),
        location: table?.name || '',
        isMatch: true
      };
    }),
    ...teamJudging.map(session => {
      const room = rooms.find(r => r.id === session.roomId);
      return {
        time: session.scheduledTime,
        type: t('schedule.judging-session', {
          number: session.number,
          room: room?.name || '',
          teamNumber: teamNumber
        }),
        location: room?.name || '',
        isMatch: false
      };
    })
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <ScheduleIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          {t('schedule.title')}
        </Typography>
      </Stack>

      <Box>
        {scheduleEntries.map((entry, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: index < scheduleEntries.length - 1 ? '1px solid' : 'none',
              borderColor: 'grey.200',
              '&:hover': {
                bgcolor: 'grey.50'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography variant="body2" fontWeight="600">
                {entry.time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
              <Box
                sx={{
                  width: '1px',
                  height: '20px',
                  bgcolor: 'grey.400',
                  mx: 2
                }}
              />
              <Typography variant="body2" fontWeight="600">
                {entry.type}
              </Typography>
            </Box>
          </Box>
        ))}

        {scheduleEntries.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('schedule.no-schedule')}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export { TeamSchedule };

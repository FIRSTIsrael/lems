'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Paper, Typography, Stack, Box, ListItem, ListItemText, Divider } from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import { useMatchTranslations } from '@lems/localization';
import { TeamJudgingSession, TeamRobotGameMatch, AgendaEvent } from '@lems/types/api/portal';
import { useRealtimeData } from '../../../../../hooks/use-realtime-data';
import { useTeamAtEvent } from './team-at-event-context';

interface ScheduleEntry {
  time: Date;
  description: string;
  location: string;
}

export const TeamSchedule: React.FC = () => {
  const { event, team } = useTeamAtEvent();

  const { data } = useRealtimeData<{
    session: TeamJudgingSession;
    matches: TeamRobotGameMatch[];
    agenda: AgendaEvent[];
  } | null>(`/portal/events/${event.slug}/teams/${team.slug}/activities`, {
    suspense: true
  });

  const t = useTranslations('pages.team-in-event');
  const { getStage } = useMatchTranslations();

  if (!data) {
    return null; // Should be handled by suspense
  }

  const { session: judgingSession, matches, agenda } = data;

  const scheduleEntries: ScheduleEntry[] = [
    ...(matches || []).map(match => ({
      time: new Date(match.scheduledTime),
      description: t('schedule.match-type', {
        stage: getStage(match.stage),
        number: match.number,
        table: match.table.name,
        teamNumber: team.number
      }),
      location: match.table.name
    })),
    ...(judgingSession
      ? [
          {
            time: new Date(judgingSession.scheduledTime),
            description: t('schedule.judging-session', {
              room: judgingSession.room.name,
              teamNumber: team.number,
              number: judgingSession.number
            }),
            location: judgingSession.room.name
          }
        ]
      : []),
    ...(agenda || []).map(agendaItem => ({
      time: new Date(agendaItem.startTime),
      description: agendaItem.title,
      location: agendaItem.location || ''
    }))
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  return (
    <Paper
      sx={{
        p: 3,
        flexGrow: { xs: 0, lg: 1 },
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <ScheduleIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          {t('schedule.title')}
        </Typography>
      </Stack>

      {scheduleEntries.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('schedule.no-schedule')}
          </Typography>
        </Box>
      )}

      {scheduleEntries.length > 0 && (
        <Stack spacing={0} divider={<Divider />}>
          {scheduleEntries.map((entry, index) => (
            <React.Fragment key={index}>
              <ListItem
                sx={{
                  py: 2,
                  px: 0,
                  '&:hover': {
                    bgcolor: 'grey.50'
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="body2" fontWeight="600">
                        {dayjs(entry.time).format('HH:mm')}
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
                        {entry.description}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

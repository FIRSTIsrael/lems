'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Paper, Typography, Stack, Box, ListItem, ListItemText, Divider } from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import { useMatchTranslations } from '@lems/localization';
import type { TableSide } from '@lems/shared/utils';
import { TeamJudgingSession, TeamRobotGameMatch, AgendaEvent } from '@lems/types/api/portal';
import { useRealtimeData } from '../../../../../hooks/use-realtime-data';
import { useTeamAtEvent } from './team-at-event-context';

interface ScheduleEntry {
  time: Date;
  description: string;
  location: string;
}

interface PracticeTableAssignment {
  id: string;
  tableNumber: number;
  side?: TableSide | null;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
}

export const TeamSchedule: React.FC = () => {
  const { event, team } = useTeamAtEvent();

  const { data } = useRealtimeData<{
    session: TeamJudgingSession;
    matches: TeamRobotGameMatch[];
    agenda: AgendaEvent[];
    practiceAssignments: PracticeTableAssignment[];
  } | null>(`/portal/events/${event.slug}/teams/${team.slug}/activities`, {
    suspense: true
  });

  const t = useTranslations('pages.team-in-event');
  const { getStage, getOpponentLabel } = useMatchTranslations();

  if (!data) {
    return null; // Should be handled by suspense
  }

  const { session: judgingSession, matches, agenda, practiceAssignments } = data;

  const scheduleEntries: ScheduleEntry[] = [
    ...(matches || []).map(match => ({
      time: new Date(match.scheduledTime),
      description:
        t('schedule.match-type', {
          stage: getStage(match.stage),
          number: match.number,
          table: match.table.name,
          teamNumber: team.number
        }) + (match.opponent ? ` · ${getOpponentLabel(match.opponent)}` : ''),
      location: match.table.name
    })),
    ...(judgingSession
      ? [
          {
            time: new Date(judgingSession.scheduledTime),
            description: t('schedule.judging-session', {
              room: judgingSession.room.name
            }),
            location: judgingSession.room.name
          }
        ]
      : []),
    ...(practiceAssignments || []).map(assignment => {
      const values = { tableNumber: assignment.tableNumber, side: assignment.side ?? '' };
      return {
        time: new Date(assignment.startTime),
        description: assignment.side
          ? t('schedule.practice-table-side', values)
          : t('schedule.practice-table', values),
        location: assignment.side
          ? t('schedule.practice-table-side-location', values)
          : t('schedule.practice-table-location', values)
      };
    }),
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
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          mb: 2
        }}
      >
        <ScheduleIcon color="primary" />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold'
          }}
        >
          {t('schedule.title')}
        </Typography>
      </Stack>
      {scheduleEntries.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary'
            }}
          >
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
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: '600'
                        }}
                      >
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
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: '600'
                        }}
                      >
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

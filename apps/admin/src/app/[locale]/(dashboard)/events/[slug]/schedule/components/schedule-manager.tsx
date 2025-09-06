'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Alert, Box, Grid, Stack } from '@mui/material';
import { Groups, Domain, Warning, CheckCircle } from '@mui/icons-material';
import { Division } from '@lems/types/api/admin';
import { useEvent } from '../../components/event-context';
import { ScheduleProvider, useSchedule } from './schedule-context';
import { ScheduleSettings } from './schedule-settings';
import { ScheduleCalendar } from './calendar/schedule-calendar';
import { TeamSwapper } from './team-swapper';
import { LinkCard } from './link-card';

interface ScheduleManagerProps {
  division: Division;
}

const ScheduleManagerContent: React.FC<ScheduleManagerProps> = ({ division }) => {
  const t = useTranslations('pages.events.schedule');
  const event = useEvent();
  const { teamsCount, roomsCount, tablesCount } = useSchedule();

  if (division.hasSchedule) {
    return (
      <Stack height="100%" spacing={2}>
        <Alert severity="success" icon={<CheckCircle />} sx={{ py: 0.5 }}>
          {t('alerts.schedule-set-up')}
        </Alert>
        <TeamSwapper />
      </Stack>
    );
  }

  if (teamsCount === 0 || roomsCount === 0 || tablesCount === 0) {
    return (
      <Stack height="100%" spacing={2}>
        <Alert severity="warning" icon={<Warning />} sx={{ py: 0.5 }}>
          {t('alerts.missing-details')}
        </Alert>
        <Grid container spacing={2} sx={{ maxWidth: 600 }}>
          <Grid size={6}>
            <LinkCard
              href={`/events/${event.slug}/teams`}
              title={t('links.teams.title')}
              description={t('links.teams.description')}
              icon={<Groups sx={{ fontSize: 48 }} />}
            />
          </Grid>
          <Grid size={6}>
            <LinkCard
              href={`/events/${event.slug}/venue`}
              title={t('links.venue.title')}
              description={t('links.venue.description')}
              icon={<Domain sx={{ fontSize: 48 }} />}
              preserveDivisionId
            />
          </Grid>
        </Grid>
      </Stack>
    );
  }

  return (
    <Grid container component={Box} spacing={3} sx={{ height: '100%' }}>
      <Grid size={7} sx={{ height: '100%' }}>
        <ScheduleCalendar />
      </Grid>
      <Grid size={5} sx={{ height: '100%' }}>
        <ScheduleSettings />
      </Grid>
    </Grid>
  );
};

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({ division }) => {
  return (
    <ScheduleProvider eventId={division.eventId} divisionId={division.id}>
      <ScheduleManagerContent division={division} />
    </ScheduleProvider>
  );
};

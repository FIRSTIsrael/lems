'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Alert, Box, Grid } from '@mui/material';
import { Division } from '@lems/types/api/admin';
import { Warning } from '@mui/icons-material';
import { ScheduleProvider, useSchedule } from './schedule-context';
import { ScheduleSettings } from './schedule-settings';
import { ScheduleCalendar } from './schedule-calendar';

interface ScheduleManagerProp {
  division: Division;
}

const ScheduleManagerContent: React.FC = () => {
  const t = useTranslations('pages.events.schedule');
  const { teams, rooms, tables } = useSchedule();

  if (!teams.length || !rooms.length || !tables.length) {
    return (
      <>
        <Alert severity="warning" icon={<Warning />} sx={{ py: 0.5 }}>
          {t('alerts.missing-details')}
        </Alert>
        {/* TODO: Add links to teams and venue pages */}
      </>
    );
  }

  return (
    <Grid container component={Box} spacing={3}>
      <Grid size={7}>
        <ScheduleCalendar />
      </Grid>
      <Grid size={5}>
        <ScheduleSettings />
      </Grid>
    </Grid>
  );
};

export const ScheduleManager: React.FC<ScheduleManagerProp> = ({ division }) => {
  return (
    <ScheduleProvider eventId={division.eventId} divisionId={division.id}>
      <ScheduleManagerContent />
    </ScheduleProvider>
  );
};

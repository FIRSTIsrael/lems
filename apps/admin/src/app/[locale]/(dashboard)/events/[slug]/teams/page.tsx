'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Stack, Switch, Typography, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Division, TeamWithDivision } from '@lems/types/api/admin';
import { useEvent } from '../components/event-context';
import { EventPageTitle } from '../components/event-page-title';
import { EventTeamsUnifiedView } from './components/event-teams-unified-view';
import { EventTeamsSplitView } from './components/event-teams-split-view';
import { RegisterTeamsButton } from './components/register-teams-button';
import { RegisterTeamsFromCSVButton } from './components/register-teams-from-csv-button';
import { ScheduleExists } from './components/schedule-exists';

export default function EventTeamsPage() {
  const event = useEvent();

  const t = useTranslations('pages.events.teams');
  const [isUnified, setIsUnified] = useState(true);

  const { data: divisions = [] } = useSWR<Division[]>(`/admin/events/${event.id}/divisions`);
  const { data: teams = [] } = useSWR<TeamWithDivision[]>(`/admin/events/${event.id}/teams`);

  return (
    <Box
      sx={{
        height: 'calc(100vh - 40px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <EventPageTitle title={t('title', { eventName: event.name })}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography color={isUnified ? 'primary' : 'text.secondary'}>
              {t('view-toggle.unified')}
            </Typography>
            <Switch
              checked={!isUnified}
              onChange={e => setIsUnified(!e.target.checked)}
              color="primary"
            />
            <Typography color={!isUnified ? 'primary' : 'text.secondary'}>
              {t('view-toggle.split')}
            </Typography>
          </Stack>
        </EventPageTitle>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <RegisterTeamsButton event={event} divisions={divisions} />
          <RegisterTeamsFromCSVButton event={event} divisions={divisions} />
        </Stack>

        <ScheduleExists divisions={divisions} />

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {isUnified ? (
            <EventTeamsUnifiedView teams={teams} divisions={divisions} eventId={event.id} />
          ) : (
            <EventTeamsSplitView eventId={event.id} />
          )}
        </Box>
      </Box>
    </Box>
  );
}

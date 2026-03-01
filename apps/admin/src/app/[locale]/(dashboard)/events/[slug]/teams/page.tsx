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
import { EventTeamsEditView } from './components/event-teams-edit-view';
import { RegisterTeamsButton } from './components/register-teams-button';
import { RegisterTeamsFromCSVButton } from './components/register-teams-from-csv-button';
import { ScheduleExists } from './components/schedule-exists';

type ViewMode = 'unified' | 'split' | 'edit';

export default function EventTeamsPage() {
  const event = useEvent();

  const t = useTranslations('pages.events.teams');
  const [viewMode, setViewMode] = useState<ViewMode>('unified');

  const { data: divisions = [] } = useSWR<Division[]>(`/admin/events/${event.id}/divisions`);
  const { data: teams = [] } = useSWR<TeamWithDivision[]>(`/admin/events/${event.id}/teams`);

  const divisionsWithSchedule = divisions.filter(division => division.hasSchedule);
  const canEditTeams = divisionsWithSchedule.length > 0;

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
            <Typography color={viewMode === 'unified' ? 'primary' : 'text.secondary'}>
              {t('view-toggle.unified')}
            </Typography>
            <Switch
              checked={viewMode !== 'unified'}
              onChange={e => setViewMode(e.target.checked ? 'split' : 'unified')}
              disabled={viewMode === 'edit'}
              color="primary"
            />
            <Typography color={viewMode === 'split' ? 'primary' : 'text.secondary'}>
              {t('view-toggle.split')}
            </Typography>
          </Stack>
        </EventPageTitle>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <RegisterTeamsButton event={event} divisions={divisions} />
          <RegisterTeamsFromCSVButton event={event} divisions={divisions} />
        </Stack>

        <ScheduleExists divisions={divisions} onEditModeClick={() => setViewMode('edit')} />

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {viewMode === 'unified' && (
            <EventTeamsUnifiedView teams={teams} divisions={divisions} eventId={event.id} />
          )}
          {viewMode === 'split' && <EventTeamsSplitView eventId={event.id} />}
          {viewMode === 'edit' && (
            <EventTeamsEditView eventId={event.id} divisions={divisionsWithSchedule} />
          )}
        </Box>
      </Box>
    </Box>
  );
}

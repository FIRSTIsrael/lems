'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Stack, Switch, Typography, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { TeamWithDivision } from '@lems/types/api/admin';
import { useEvent } from '../layout';
import { EventTeamsUnifiedView } from './components/event-teams-unified-view';
import { EventTeamsSplitView } from './components/event-teams-split-view';
import RegisterTeamsButton from './components/register-teams-button';

export default function EventTeamsPage() {
  const event = useEvent();

  const t = useTranslations('pages.events.teams');
  const [isUnified, setIsUnified] = useState(true);

  const { data: divisions = [] } = useSWR<TeamWithDivision[]>(
    `/admin/events/${event.slug}/divisions`
  );
  const { data: teams = [] } = useSWR<TeamWithDivision[]>(`/admin/events/${event.slug}/teams`);

  return (
    <Box
      sx={{
        height: 'calc(100vh - 40px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h1" gutterBottom>
            {t('title', { eventName: event.name })}
          </Typography>
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
        </Stack>

        <Box sx={{ mb: 2 }}>
          <RegisterTeamsButton event={event} />
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {isUnified ? (
            <EventTeamsUnifiedView teams={teams} hasMultipleDivisions={divisions.length > 1} />
          ) : (
            <EventTeamsSplitView eventId={event.id} />
          )}
        </Box>
      </Box>
    </Box>
  );
}

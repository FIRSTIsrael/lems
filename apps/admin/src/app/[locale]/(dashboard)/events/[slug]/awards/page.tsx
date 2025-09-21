'use client';

import useSWR from 'swr';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { TeamWithDivision } from '@lems/types/api/admin';
import { useEvent } from '../components/event-context';
import { EventPageTitle } from '../components/event-page-title';

export default function EventAwardsPage() {
  const event = useEvent();

  const t = useTranslations('pages.events.awards');

  const { data: divisions = [] } = useSWR<TeamWithDivision[]>(
    `/admin/events/${event.id}/divisions`
  );

  return (
    <Box
      sx={{
        height: 'calc(100vh - 40px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <EventPageTitle title={t('title', { eventName: event.name })} />
      </Box>
    </Box>
  );
}

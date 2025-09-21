'use client';

import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Box } from '@mui/material';
import { Division } from '@lems/types/api/admin';
import { useEvent } from '../components/event-context';
import { EventPageTitle } from '../components/event-page-title';
import { DivisionSelector } from '../components/division-selector';

export default function EventAwardsPage() {
  const t = useTranslations('pages.events.awards');
  const event = useEvent();
  const searchParams = useSearchParams();

  const { data: divisions = [] } = useSWR<Division[]>(`/admin/events/${event.id}/divisions`, {
    suspense: true,
    fallbackData: []
  });

  const selectedDivisionId = searchParams.get('division') || divisions[0]?.id;
  const selectedDivision = divisions.find(division => division.id === selectedDivisionId);

  return (
    <Box
      sx={{
        height: 'calc(100vh - 40px)',
        display: 'flex',
        flexDirection: 'column',
        p: 3
      }}
    >
      <EventPageTitle title={t('title', { eventName: event.name })} />

      {divisions.length > 1 && (
        <Box sx={{ mb: 3 }}>
          <DivisionSelector divisions={divisions} />
        </Box>
      )}

      {/* Award page content goes here */}
    </Box>
  );
}

'use client';

import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Stack } from '@mui/material';
import { Division } from '@lems/types/api/admin';
import { useEvent } from '../components/event-context';
import { EventPageTitle } from '../components/event-page-title';
import { DivisionSelector } from '../components/division-selector';
import { AwardsEditor } from './components/awards-editor';

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
    <Stack spacing={3} sx={{ mb: 3 }}>
      <EventPageTitle title={t('title', { eventName: event.name })} />

      {divisions.length > 1 && <DivisionSelector divisions={divisions} />}

      {selectedDivision && <AwardsEditor key={selectedDivisionId} />}
    </Stack>
  );
}

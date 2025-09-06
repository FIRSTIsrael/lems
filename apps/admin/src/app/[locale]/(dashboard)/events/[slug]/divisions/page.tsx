'use client';

import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Division, AdminDivisionsResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '../../../../../../lib/fetch';
import { useEvent } from '../components/event-context';
import { EventPageTitle } from '../components/event-page-title';
import { DivisionsTable } from './components/divisions-table';
import { CreateDivisionButton } from './components/create-division-button';

export default function EventDivisionsPage() {
  const event = useEvent();
  const t = useTranslations('pages.events.divisions');

  const { data: divisions = [], mutate } = useSWR<Division[]>(
    `/admin/events/${event.id}/divisions`,
    async (url: string) => {
      const result = await apiFetch(url, undefined, AdminDivisionsResponseSchema);
      if (result.ok) {
        return result.data;
      }
      throw new Error('Failed to fetch divisions');
    }
  );

  const handleDivisionChange = async () => {
    mutate();
  };

  return (
    <>
      <EventPageTitle title={t('title', { eventName: event.name })} />
      <CreateDivisionButton onCreate={handleDivisionChange} />
      <DivisionsTable divisions={divisions} onEditDivision={handleDivisionChange} />
    </>
  );
}

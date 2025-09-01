'use client';

import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Box } from '@mui/material';
import { EventPageTitle } from '../components/event-page-title';
import { useEvent } from '../components/event-context';
import { DivisionSelector } from '../components/division-selector';
import { ScheduleManager } from './components/schedule-manager';

export default function EventSchedulePage() {
  const t = useTranslations('pages.events.schedule');
  const event = useEvent();
  const searchParams = useSearchParams();

  const { data: divisions } = useSWR(`/admin/events/${event.id}/divisions`, {
    suspense: true,
    fallbackData: []
  });

  const selectedDivisionId = searchParams.get('division') || divisions[0]?.id;
  const selectedDivision = divisions.find((d: { id: string }) => d.id === selectedDivisionId);

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
      <EventPageTitle title={t('title', { eventName: event.name })} />

      {divisions.length > 1 && (
        <Box sx={{ mb: 3, flexShrink: 0 }}>
          <DivisionSelector divisions={divisions} />
        </Box>
      )}

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {selectedDivision && <ScheduleManager division={selectedDivision} />}
      </Box>

      {/* <Alert severity="success" icon={<CheckCircle />} sx={{ py: 0.5 }}>
        {t('alerts.schedule-set-up')}
      </Alert> */}
    </Box>
  );
}

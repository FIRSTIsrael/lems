'use client';

import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Box, Typography, Alert } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { useEvent } from '../layout';
import { DivisionSelector } from '../components/division-selector';
import { ScheduleManager } from './components/schedule-manager';

export default function EventSchedulePage() {
  const t = useTranslations('pages.events.schedule');
  const event = useEvent();
  const searchParams = useSearchParams();

  const { data: divisions } = useSWR(`/admin/events/${event.id}/divisions`, {
    suspense: true
  });

  const selectedDivisionId = searchParams.get('division') || divisions[0]?.id;
  const selectedDivision = divisions.find((d: { id: string }) => d.id === selectedDivisionId);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h1" gutterBottom>
        {t('title', { eventName: event.name })}
      </Typography>

      {divisions.length > 1 && (
        <Box sx={{ mb: 3 }}>
          <DivisionSelector divisions={divisions} />
        </Box>
      )}

      {selectedDivision && <ScheduleManager division={selectedDivision} />}

      {/* <Alert severity="success" icon={<CheckCircle />} sx={{ py: 0.5 }}>
        {t('alerts.schedule-set-up')}
      </Alert> */}
    </Box>
  );
}

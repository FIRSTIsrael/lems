'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { EventPageTitle } from '../components/event-page-title';
import { useEvent } from '../components/event-context';
import { PitMapEditor } from './components/pit-map-editor';

export default function PitMapPage() {
  const t = useTranslations('pages.events.pit-map');
  const event = useEvent();

  return (
    <Box sx={{ p: 3 }}>
      <EventPageTitle title={t('title', { eventName: event.name })} />
      <PitMapEditor />
    </Box>
  );
}

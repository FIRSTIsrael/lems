'use client';

import { useTranslations } from 'next-intl';
import { Box } from '@mui/material';
import { useEvent } from '../components/event-context';
import { EventPageTitle } from '../components/event-page-title';
import IntegrationGrid from './components/integration-grid';

const IntegrationsPage = () => {
  const t = useTranslations('pages.events.integrations');
  const event = useEvent();

  return (
    <Box sx={{ p: 3 }}>
      <EventPageTitle title={t('title', { eventName: event.name })} />

      <Box sx={{ mt: 3 }}>
        <IntegrationGrid />
      </Box>
    </Box>
  );
};

export default IntegrationsPage;

'use client';

import { useTranslations } from 'next-intl';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { Cable as IntegrationIcon } from '@mui/icons-material';
import { useEvent } from '../components/event-context';
import { EventPageTitle } from '../components/event-page-title';

const IntegrationsPage = () => {
  const t = useTranslations('pages.events.integrations');
  const event = useEvent();

  return (
    <Box sx={{ p: 3 }}>
      <EventPageTitle title={t('title', { eventName: event.name })} />

      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Stack
              direction="column"
              spacing={3}
              alignItems="center"
              justifyContent="center"
              sx={{ py: 8, textAlign: 'center' }}
            >
              <IntegrationIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
              <Stack spacing={1}>
                <Typography variant="h4" component="h2">
                  {t('coming-soon.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
                  {t('coming-soon.description')}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default IntegrationsPage;

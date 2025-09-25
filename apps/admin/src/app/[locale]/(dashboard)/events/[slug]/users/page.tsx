'use client';

import { useTranslations } from 'next-intl';
import { Box, Divider, Stack } from '@mui/material';
import { useEvent } from '../components/event-context';
import { EventPageTitle } from '../components/event-page-title';
import { EventAdminsSection } from './components/event-admins-section';
import { VolunteerUsersSection } from './components/volunteer-roles/volunteer-users-section';
import { VolunteerProvider } from './components/volunteer-roles/volunteer-context';

export default function EventUsersPage() {
  const event = useEvent();
  const t = useTranslations('pages.events.users');

  return (
    <Box sx={{ p: 2 }}>
      <EventPageTitle title={t('title', { eventName: event.name })} />

      <Stack spacing={4} sx={{ mt: 3 }}>
        <EventAdminsSection />

        <Divider />

        <VolunteerProvider>
          <VolunteerUsersSection />
        </VolunteerProvider>
      </Stack>
    </Box>
  );
}

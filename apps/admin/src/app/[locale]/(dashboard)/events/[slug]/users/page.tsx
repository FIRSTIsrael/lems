'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography, Divider, Stack } from '@mui/material';
import { useEvent } from '../components/event-context';
import { EventPageTitle } from '../components/event-page-title';
import { EventAdminsSection } from './components/event-admins-section';
import { VolunteerUsersSection } from './components/volunteer-users-section';

export default function EventUsersPage() {
  const event = useEvent();
  const t = useTranslations('pages.events.users');

  return (
    <Box sx={{ p: 2 }}>
      <EventPageTitle title={t('title', { eventName: event.name })} />

      <Stack spacing={4} sx={{ mt: 3 }}>
        {/* Event Admins Section */}
        <Box>
          <Typography variant="h5" gutterBottom>
            {t('sections.eventAdmins.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('sections.eventAdmins.description')}
          </Typography>
          <EventAdminsSection />
        </Box>

        <Divider />

        {/* Volunteer Users Section */}
        <Box>
          <Typography variant="h5" gutterBottom>
            {t('sections.volunteerUsers.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('sections.volunteerUsers.description')}
          </Typography>
          <VolunteerUsersSection />
        </Box>
      </Stack>
    </Box>
  );
}

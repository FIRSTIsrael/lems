import { redirect, RedirectType } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Typography, Paper, Box, Stack } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import dayjs from 'dayjs';
import { AdminEventResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '../../../../../../lib/fetch';
import { EditEventGrid } from './components/edit-event-grid';

interface EditEventPageProps {
  params: { slug: string };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { slug } = await params;

  const t = await getTranslations('pages.events.edit');

  const result = await apiFetch(`/admin/events/${slug}`, {}, AdminEventResponseSchema);

  if (!result.ok) {
    throw new Error('Failed to load event');
  }

  const { data: event } = result;

  if (!event) {
    redirect('/events', RedirectType.replace);
  }

  return (
    <>
      <Typography variant="h1" gutterBottom>
        {event.name}
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, backgroundColor: 'grey.50' }}>
        <Stack direction="row" spacing={4} alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarTodayIcon color="primary" />
            <Stack>
              <Typography variant="body2" color="text.secondary">
                {t('date')}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {dayjs(event.startDate).format('MMM D, YYYY')}
              </Typography>
            </Stack>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <LocationOnIcon color="primary" />
            <Stack>
              <Typography variant="body2" color="text.secondary">
                {t('location')}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {event.location || 'Not specified'}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <EditEventGrid event={event} />
    </>
  );
}

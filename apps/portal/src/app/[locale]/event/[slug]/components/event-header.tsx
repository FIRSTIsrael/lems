'use client';

import dayjs from 'dayjs';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { CalendarToday, LocationOn } from '@mui/icons-material';
import { EventDetails } from '@lems/types/api/portal';
interface EventHeaderProps {
  eventData: EventDetails;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ eventData }) => {
  const { seasonName, seasonSlug, name: eventName, startDate, location, official } = eventData;
  const t = useTranslations('pages.index.events');

  return (
    <Stack spacing={1} mb={3}>
      <Link href={`/events?seasonSlug=${seasonSlug}`} style={{ textDecoration: 'none' }}>
        <Typography
          variant="body2"
          sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
        >
          {seasonName}
        </Typography>
      </Link>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h2">{eventName}</Typography>
        {!official && (
          <Chip label={t('unofficial-event')} color="warning" sx={{ fontWeight: 'medium' }} />
        )}
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1, md: 3 }}
        alignItems="flex-start"
      >
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarToday fontSize="small" color="primary" />
          <Typography variant="body2" color="text.secondary">
            {dayjs(startDate).format('MMMM DD, YYYY')}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <LocationOn fontSize="small" color="primary" />
          <Typography variant="body2" color="text.secondary">
            {location}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

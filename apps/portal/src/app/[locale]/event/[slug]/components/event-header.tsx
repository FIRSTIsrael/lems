'use client';

import { Box, Typography, Stack } from '@mui/material';
import { CalendarToday, LocationOn } from '@mui/icons-material';
import Link from 'next/link';
import dayjs from 'dayjs';

interface EventHeaderProps {
  seasonName: string;
  seasonSlug: string;
  eventName: string;
  startDate: Date;
  location: string;
}

export const EventHeader: React.FC<EventHeaderProps> = ({
  seasonName,
  seasonSlug,
  eventName,
  startDate,
  location
}) => {
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
      <Typography variant="h2">{eventName}</Typography>

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

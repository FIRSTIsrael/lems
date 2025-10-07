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

const EventHeader: React.FC<EventHeaderProps> = ({
  seasonName,
  seasonSlug,
  eventName,
  startDate,
  location
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack spacing={2}>
        {/* Event Name */}
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Link href={`/events/${seasonSlug}`} style={{ textDecoration: 'none' }}>
              <Typography
                variant="body2"
                sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
              >
                {seasonName}
              </Typography>
            </Link>
          </Stack>
          <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
            {eventName}
          </Typography>

          {/* Event Details */}
          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {dayjs(startDate).format('MMMM DD, YYYY')}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2" color="primary.main">
                {location}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default EventHeader;

'use client';

import { Suspense } from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { CalendarToday, LocationOn, Celebration as CelebrationIcon } from '@mui/icons-material';
import { EventDetails } from '@lems/types/api/portal';
import { CurrentActivityDisplay } from './current-activity';
import { DivisionProvider } from './division-data-context';

interface EventHeaderProps {
  eventData: EventDetails;
  divisionId?: string;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ eventData, divisionId }) => {
  const { seasonName, seasonSlug, name: eventName, startDate, location, official } = eventData;
  const t = useTranslations('pages.index.events');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        mb: 3
      }}
    >
      <Box sx={{ flex: divisionId ? '1 1 60%' : '1 1 100%' }}>
        <Stack spacing={1}>
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
              <Chip
                icon={<CelebrationIcon />}
                label={t('unofficial-event')}
                variant="outlined"
                sx={{ fontWeight: 'medium' }}
              />
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
      </Box>

      {divisionId && (
        <Box sx={{ flex: '1 1 40%' }}>
          <DivisionProvider divisionId={divisionId}>
            <Suspense fallback={null}>
              <CurrentActivityDisplay />
            </Suspense>
          </DivisionProvider>
        </Box>
      )}
    </Box>
  );
};

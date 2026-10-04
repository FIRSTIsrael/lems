'use client';

import dayjs from 'dayjs';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Box, Typography, Stack, Chip, Button } from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  Map as MapIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { EventDetails } from '@lems/types/api/portal';
interface EventHeaderProps {
  eventData: EventDetails;
  /** When provided, a "show on map" action is displayed next to the location. */
  onShowLocation?: () => void;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ eventData, onShowLocation }) => {
  const { seasonName, seasonSlug, name: eventName, startDate, location, official } = eventData;
  const t = useTranslations('pages.index.events');
  const tNavigation = useTranslations('pages.event.navigation');

  return (
    <Stack
      spacing={1}
      sx={{
        mb: 3
      }}
    >
      <Link href={`/events?seasonSlug=${seasonSlug}`} style={{ textDecoration: 'none' }}>
        <Typography
          variant="body2"
          sx={{ color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
        >
          {seasonName}
        </Typography>
      </Link>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center'
        }}
      >
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
        sx={{
          alignItems: 'flex-start'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <CalendarToday fontSize="small" color="primary" />
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary'
            }}
          >
            {dayjs(startDate).format('MMMM DD, YYYY')}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <LocationOn fontSize="small" color="primary" />
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary'
            }}
          >
            {location}
          </Typography>
          {onShowLocation && (
            <Button
              size="small"
              startIcon={<MapIcon fontSize="small" />}
              onClick={onShowLocation}
              sx={{ py: 0, minHeight: 0 }}
            >
              {tNavigation('show-map')}
            </Button>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};

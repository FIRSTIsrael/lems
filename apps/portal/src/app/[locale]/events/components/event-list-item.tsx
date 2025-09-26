'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography, Stack, Chip, Button, alpha, useTheme } from '@mui/material';
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { EventSummary } from '@lems/types/api/portal';
import { LiveIcon } from '../../components/homepage/live-icon';

interface EventListItemProps {
  event: EventSummary;
  variant?: 'active' | 'upcoming' | 'past';
}

export default function EventListItem({ event, variant = 'upcoming' }: EventListItemProps) {
  const theme = useTheme();
  const tEvents = useTranslations('pages.index.events');

  const getStatusChip = () => {
    switch (variant) {
      case 'active':
        return <LiveIcon />;
      case 'past':
        return (
          <Chip
            label="Completed"
            color="primary"
            size="small"
            variant="outlined"
            sx={{ minWidth: 80 }}
          />
        );
      default:
        return (
          <Chip
            label="Upcoming"
            color="primary"
            size="small"
            variant="outlined"
            sx={{ minWidth: 80 }}
          />
        );
    }
  };

  const getHoverStyles = () => {
    switch (variant) {
      case 'active':
        return {
          bgcolor: alpha(theme.palette.error.main, 0.02),
          borderLeft: `3px solid ${theme.palette.error.main}`
        };
      case 'past':
        return {
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderLeft: `3px solid ${theme.palette.primary.main}`
        };
      default:
        return {
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderLeft: `3px solid ${theme.palette.primary.main}`
        };
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': getHoverStyles()
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        {/* Event Info */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
              {event.name}
            </Typography>
            {getStatusChip()}
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1, sm: 3 }}
            sx={{ color: 'text.secondary' }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarIcon fontSize="small" />
              <Typography variant="body2">
                {new Date(event.startDate).toLocaleDateString()}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationIcon fontSize="small" />
              <Typography variant="body2">{event.location}</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <PeopleIcon fontSize="small" />
              <Typography variant="body2">
                {tEvents('teams-registered', { count: event.teamsRegistered })}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Action Button */}
        <Button
          variant={variant === 'active' ? 'contained' : 'outlined'}
          color={variant === 'active' ? 'error' : 'primary'}
          size="small"
          endIcon={<ArrowIcon />}
          sx={{
            minWidth: { xs: '100%', sm: 'auto' },
            whiteSpace: 'nowrap'
          }}
        >
          {variant === 'active'
            ? 'View Event'
            : variant === 'past'
              ? 'View Results'
              : 'View Details'}
        </Button>
      </Stack>
    </Box>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Box, Typography, Stack, Chip, Button, alpha, useTheme } from '@mui/material';
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  ArrowForward,
  ArrowBack,
  InfoOutlined
} from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';
import { Flag } from '@lems/shared';
import { EventSummary } from '@lems/types/api/portal';
import { LiveIcon } from '../../components/homepage/live-icon';

interface EventListItemProps {
  event: EventSummary;
  variant?: 'active' | 'upcoming' | 'past';
}

export const EventListItem: React.FC<EventListItemProps> = ({ event, variant = 'upcoming' }) => {
  const theme = useTheme();
  const tEvents = useTranslations('pages.index.events');

  const getStatusChip = () => {
    switch (variant) {
      case 'active':
        return <LiveIcon />;
      case 'past':
        if (event.completed) {
          return (
            <Chip
              label={tEvents('status-completed')}
              color="primary"
              size="small"
              variant="outlined"
              sx={{ minWidth: 80 }}
            />
          );
        }
        return null;
      default:
        return (
          <Chip
            label={tEvents('status-upcoming')}
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
        transition: 'all 0.1s ease-in-out',
        '&:hover': getHoverStyles()
      }}
    >
      <Link href={`/event/${event.slug}`} style={{ textDecoration: 'none' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
                {event.name}
              </Typography>
              {!event.official && (
                <Chip
                  icon={<InfoOutlined />}
                  label={tEvents('unofficial-event')}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 'medium' }}
                />
              )}
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
                <Flag region={event.region} size={18} />
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <PeopleIcon fontSize="small" />
                <Typography variant="body2">
                  {tEvents('teams-registered', { count: event.teamsRegistered })}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Button
            variant={variant === 'active' ? 'contained' : 'outlined'}
            color={variant === 'active' ? 'error' : 'primary'}
            size="small"
            endIcon={<DirectionalIcon ltr={ArrowForward} rtl={ArrowBack} />}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
              whiteSpace: 'nowrap'
            }}
          >
            {variant === 'active'
              ? tEvents('view-event')
              : event.completed
                ? tEvents('view-results')
                : tEvents('view-details')}
          </Button>
        </Stack>
      </Link>
    </Box>
  );
};

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Box,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  ArrowForward as ArrowIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { EventSummary } from '@lems/types/api/portal';
import { LiveIcon } from './live-icon';

interface EventCardProps {
  event: EventSummary;
  variant?: 'active' | 'upcoming' | 'past';
}

export const EventCard: React.FC<EventCardProps> = ({ event, variant = 'upcoming' }) => {
  const theme = useTheme();
  const t = useTranslations('pages.index.events');

  const getCardStyles = () => {
    switch (variant) {
      case 'active':
        return {
          border: `2px solid ${theme.palette.error.main}`,
          bgcolor: alpha(theme.palette.error.main, 0.05),
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
            borderColor: theme.palette.error.dark
          }
        };
      case 'past':
        return {
          bgcolor: 'background.paper',
          opacity: 0.8,
          '&:hover': {
            opacity: 1,
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
            bgcolor: alpha(theme.palette.secondary.main, 0.02)
          }
        };
      default: // upcoming
        return {
          bgcolor: 'background.paper',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[6],
            bgcolor: alpha(theme.palette.primary.main, 0.02)
          }
        };
    }
  };

  const getActionButton = () => {
    switch (variant) {
      case 'active':
        return (
          <Button variant="contained" color="error" endIcon={<ArrowIcon />} sx={{ ml: 'auto' }}>
            View Event
          </Button>
        );
      case 'past':
        return (
          <Button variant="text" size="small" endIcon={<ArrowIcon />}>
            View Results
          </Button>
        );
      default: // upcoming
        return (
          <Button variant="outlined" endIcon={<ArrowIcon />}>
            View Details
          </Button>
        );
    }
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        ...getCardStyles()
      }}
    >
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          spacing={{ xs: 2, sm: 0 }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {event.name}
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {event.startDate.toLocaleDateString()}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {event.location}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PeopleIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {t('teams-registered', { count: event.teamsRegistered })}
                </Typography>
              </Stack>
            </Stack>
          </Box>
          {variant === 'active' && (
            <Box sx={{ alignSelf: 'flex-start' }}>
              <LiveIcon />
            </Box>
          )}
        </Stack>
      </CardContent>
      <CardActions>{getActionButton()}</CardActions>
    </Card>
  );
};

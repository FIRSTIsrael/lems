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
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  ArrowForward,
  ArrowBack,
  CalendarToday as CalendarIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';
import { EventSummary } from '@lems/types/api/portal';
import { Flag } from '@lems/shared';
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
            boxShadow: theme.shadows[6],
            borderColor: theme.palette.error.dark
          }
        };
      case 'past':
        return {
          bgcolor: 'background.paper',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[6],
            bgcolor: alpha(theme.palette.secondary.main, 0.02)
          }
        };
      default: // upcoming
        return {
          bgcolor: 'background.paper',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[6],
            bgcolor: alpha(theme.palette.secondary.main, 0.02)
          }
        };
    }
  };

  const getActionButton = () => {
    switch (variant) {
      case 'active':
        return (
          <Button
            component="span"
            variant="contained"
            color="error"
            endIcon={<DirectionalIcon ltr={ArrowForward} rtl={ArrowBack} />}
            sx={{ ml: 'auto' }}
          >
            {t('view-event')}
          </Button>
        );
      case 'past':
        return (
          <Button
            component="span"
            variant="outlined"
            sx={{ ml: 'auto' }}
            endIcon={<DirectionalIcon ltr={ArrowForward} rtl={ArrowBack} />}
          >
            {t('view-results')}
          </Button>
        );
      default: // upcoming
        return (
          <Button
            component="span"
            variant="outlined"
            sx={{ ml: 'auto' }}
            endIcon={<DirectionalIcon ltr={ArrowForward} rtl={ArrowBack} />}
          >
            {t('view-details')}
          </Button>
        );
    }
  };

  return (
    <Card
      component="a"
      href={`/event/${event.slug}`}
      variant="outlined"
      sx={{
        transition: 'all 0.2s ease-in-out',
        textDecoration: 'none',
        ...getCardStyles()
      }}
    >
      <CardContent sx={{ position: 'relative' }}>
        {variant === 'active' && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1
            }}
          >
            <LiveIcon />
          </Box>
        )}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 0 }}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'flex-start' }
          }}
        >
          <Box sx={{ flex: 1, pr: variant === 'active' ? { xs: 6, sm: 0 } : 0 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                mb: 1
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold'
                }}
              >
                {event.name}
              </Typography>
              {!event.official && (
                <Chip
                  icon={<CelebrationIcon />}
                  label={t('unofficial-event')}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 'medium' }}
                />
              )}
            </Stack>
            <Stack spacing={1}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center'
                }}
              >
                <CalendarIcon fontSize="small" color="action" />
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary'
                  }}
                >
                  {event.startDate.toLocaleDateString()}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center'
                }}
              >
                <LocationIcon fontSize="small" color="action" />
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  {event.location}
                  <Flag region={event.region} size={18} />
                </Typography>
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center'
                }}
              >
                <PeopleIcon fontSize="small" color="action" />
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary'
                  }}
                >
                  {t('teams-registered', { count: event.teamsRegistered })}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
      <CardActions>{getActionButton()}</CardActions>
    </Card>
  );
};

'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardActionArea,
  Stack,
  Box,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { CalendarToday as CalendarIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';
import { Flag } from '@lems/shared';
import { Event } from '@lems/types/api/lems';

interface EventCardProps {
  event: Event;
  variant: 'live' | 'upcoming';
}

export const EventCard: React.FC<EventCardProps> = ({ event, variant }) => {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('homepage');

  const handleClick = () => {
    // Navigation is now handled at layout level
    // Simply navigate to event login page
    router.push(`/${event.slug}/login`);
  };

  const isLive = variant === 'live';

  const cardStyles = isLive
    ? {
        border: `2px solid ${theme.palette.error.main}`,
        bgcolor: alpha(theme.palette.error.main, 0.05),
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[12],
          borderColor: theme.palette.error.dark,
          bgcolor: alpha(theme.palette.error.main, 0.08)
        }
      }
    : {
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: theme.palette.primary.main,
          bgcolor: alpha(theme.palette.primary.main, 0.02)
        }
      };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...cardStyles
      }}
    >
      <CardActionArea onClick={handleClick}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 }, position: 'relative' }}>
          {isLive && (
            <Box
              position="absolute"
              top={16}
              right={16}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'error.main',
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: 'white',
                  borderRadius: '50%',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.5, transform: 'scale(0.8)' }
                  }
                }}
              />
              LIVE
            </Box>
          )}

          <Stack spacing={2.5}>
            {/* Event Name */}
            <Box sx={{ pr: isLive ? 10 : 0 }}>
              <Typography
                variant="h5"
                fontWeight="700"
                gutterBottom
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' }
                }}
              >
                {event.name}
              </Typography>
            </Box>

            {/* Event Details */}
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <CalendarIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" fontSize="0.95rem">
                  {new Date(event.startDate).toLocaleDateString(locale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Flag region={event.region} size={18} />
                <Typography variant="body2" color="text.secondary" fontSize="0.95rem">
                  {event.region}
                </Typography>
              </Stack>
            </Stack>

            {/* Action indicator */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                color: isLive ? 'error.main' : 'primary.main',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              <Typography variant="body2" fontWeight="600">
                {isLive ? t('view-event') : t('view-details')}
              </Typography>
              <ArrowIcon fontSize="small" />
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

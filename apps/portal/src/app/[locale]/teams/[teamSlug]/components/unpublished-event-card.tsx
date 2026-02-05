'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, Typography, Stack, Button, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { TeamEventResult } from '@lems/types/api/portal';
import { Element } from 'react-scroll';
import dayjs from 'dayjs';
import { useTeam } from './team-context';

interface UnpublishedEventCardProps {
  eventResult: TeamEventResult;
}

export const UnpublishedEventCard: React.FC<UnpublishedEventCardProps> = ({ eventResult }) => {
  const t = useTranslations('pages.team.events');
  const team = useTeam();

  const eventDate = dayjs(eventResult.eventDate);
  const today = dayjs().startOf('day');

  const isBeforeEvent = eventDate.isAfter(today);
  const isDuringEvent = eventDate.isSame(today, 'day');

  const getStatusText = () => {
    if (isBeforeEvent) return t('view-event-details');
    if (isDuringEvent) return t('event-in-progress');
    return t('view-event-results');
  };

  const getButtonText = () => {
    if (isBeforeEvent) return t('view-event-details');
    if (isDuringEvent) return t('view-live-data');
    return t('view-event-results');
  };

  return (
    <Element name={`event-${eventResult.eventSlug}`}>
      <Link
        href={`/event/${eventResult.eventSlug}/team/${team.slug}`}
        style={{ textDecoration: 'none' }}
      >
        <Card
          variant="outlined"
          sx={{
            mb: 2,
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
              transition: 'all 0.2s ease-in-out'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography variant="h4" fontWeight="600" color="primary">
                  {eventResult.eventName}
                </Typography>
                {isDuringEvent && (
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: 'error.main',
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': {
                          opacity: 1
                        },
                        '50%': {
                          opacity: 0.3
                        }
                      }
                    }}
                  />
                )}
              </Stack>
              <Button variant="text">{getButtonText()}</Button>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              {getStatusText()}
            </Typography>
          </CardContent>
        </Card>
      </Link>
    </Element>
  );
};

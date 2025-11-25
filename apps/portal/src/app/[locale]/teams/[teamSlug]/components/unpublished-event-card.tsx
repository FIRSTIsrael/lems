'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, Typography, Stack, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { TeamEventResult } from '@lems/types/api/portal';
import { Element } from 'react-scroll';
import { useTeam } from './team-context';

interface UnpublishedEventCardProps {
  eventResult: TeamEventResult;
}

export const UnpublishedEventCard: React.FC<UnpublishedEventCardProps> = ({ eventResult }) => {
  const t = useTranslations('pages.team.events');
  const team = useTeam();

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
              <Typography variant="h4" fontWeight="600" color="primary">
                {eventResult.eventName}
              </Typography>
              <Button variant="text">{t('view-live-data')}</Button>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              {t('event-in-progress')}
            </Typography>
          </CardContent>
        </Card>
      </Link>
    </Element>
  );
};

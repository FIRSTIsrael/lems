'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { Typography, Paper, Stack, Box } from '@mui/material';
import { TeamEventResult } from '@lems/types/api/portal';
import { Element } from 'react-scroll';
import { TeamEventResultCard } from './team-event-result-card';
import { UnpublishedEventCard } from './unpublished-event-card';
import { useTeam } from './team-context';

export const TeamResults: React.FC = () => {
  const t = useTranslations('pages.team.events');

  const searchParams = useSearchParams();
  const team = useTeam();
  // Default to the team's last competed season, not 'latest'
  const season = searchParams.get('season') ?? team.lastCompetedSeason?.slug;

  const { data: eventResults } = useSWR<TeamEventResult[]>(
    season ? () => `/portal/teams/${team.slug}/events/results?season=${season}` : null,
    { suspense: true, fallbackData: [] }
  );

  // Don't render anything if the team has never competed
  if (!season) {
    return null;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Element name="event-results">
        <Box>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 600 }}>
            {t('event-performance')}
          </Typography>
        </Box>
      </Element>
      {!eventResults || eventResults.length === 0 ? (
        <Box sx={{ mt: 3, textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {t('no-events-this-season')}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3} sx={{ mt: 3 }}>
          {eventResults.map(eventResult => {
            if (!eventResult.results) {
              return (
                <UnpublishedEventCard
                  key={`event-${eventResult.eventSlug}`}
                  eventResult={eventResult}
                />
              );
            }

            return (
              <TeamEventResultCard
                key={`event-${eventResult.eventSlug}`}
                eventResult={eventResult}
              />
            );
          })}
        </Stack>
      )}
    </Paper>
  );
};

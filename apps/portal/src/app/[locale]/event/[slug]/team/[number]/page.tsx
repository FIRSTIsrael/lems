'use client';

import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { DirectionalIcon } from '@lems/localization';
import { TeamInEventData, mockTeamInEventData } from './mock-data';
import { TeamInfoHeader } from './components/team-info-header';
import { EventSummary } from './components/event-summary';
import { TeamSchedule } from './components/team-schedule';

export default function TeamInEventPage() {
  const params = useParams();
  const eventSlug = params.slug as string;
  const teamNumber =
    params.number && typeof params.number === 'string' ? parseInt(params.number, 10) : null;

  const t = useTranslations('pages.team-in-event');

  // Mock data for now - replace with actual API call
  const { data: teamData, error } = useSWR<TeamInEventData | null>(
    `/portal/events/${eventSlug}/teams/${teamNumber}`,
    {
      suspense: true,
      fallbackData: null
    }
  );

  // Use mock data for development - replace with actual API call
  const data = teamData || {
    ...mockTeamInEventData,
    eventSlug: eventSlug
  };

  if (!data || !data.team) {
    if (error) {
      return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
          <Container maxWidth="xl" sx={{ py: 2 }}>
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom color="text.secondary">
                {t('not-found.title', { number: teamNumber || 'Unknown' })}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {t('not-found.description')}
              </Typography>
              <Button
                component={Link}
                href={`/event/${eventSlug}`}
                variant="outlined"
                startIcon={<DirectionalIcon ltr={ArrowBack} rtl={ArrowForward} />}
              >
                {t('not-found.back-to-event')}
              </Button>
            </Paper>
          </Container>
        </Box>
      );
    }
    return null;
  }

  const { team, division, eventName } = data;
  const teamScoreboard = division.scoreboard.find(entry => entry.teamId === team.id);
  const teamAwards = division.awards.filter(award => award.winner === team.number.toString());
  const teamMatches = division.fieldSchedule.filter(match =>
    match.participants.some(p => p.teamId === team.id)
  );
  const teamJudging = division.judgingSchedule.filter(session => session.teamId === team.id);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <TeamInfoHeader
          team={team}
          eventName={eventName}
          eventSlug={eventSlug}
          divisionName={division.name}
          teamScoreboard={teamScoreboard}
        />

        <EventSummary teamAwards={teamAwards} teamScoreboard={teamScoreboard} />

        <TeamSchedule
          teamMatches={teamMatches}
          teamJudging={teamJudging}
          tables={division.tables}
          rooms={division.rooms}
          teamNumber={team.number}
        />
      </Container>
    </Box>
  );
}

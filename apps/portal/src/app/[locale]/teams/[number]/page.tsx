'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { getTeamByNumber } from './components/mockTeamData';
import { TeamHeader } from './components/team-header';
import { TeamResults } from './components/team-results';
import { TeamSidebar } from './components/team-sidebar';

export default function TeamPage() {
  const params = useParams();
  const t = useTranslations('pages.team');

  // Extract team number from URL
  const teamNumber = Number(params.number);
  const team = getTeamByNumber(teamNumber) || null;

  // Season state management
  const [selectedSeason, setSelectedSeason] = useState<string>(
    team?.seasons?.[0]?.toString() || '2025'
  );

  if (!team) {
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
            <Button component={Link} href="/teams" variant="outlined" startIcon={<LocationIcon />}>
              {t('not-found.back-to-teams')}
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Left Sidebar */}
          <TeamSidebar
            team={team}
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
          />

          {/* Main Content Area */}
          <Box sx={{ flex: 1 }}>
            {/* Team Header */}
            <TeamHeader team={team} teamNumber={teamNumber!} />

            {/* Team Results */}
            <TeamResults team={team} teamNumber={teamNumber!} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

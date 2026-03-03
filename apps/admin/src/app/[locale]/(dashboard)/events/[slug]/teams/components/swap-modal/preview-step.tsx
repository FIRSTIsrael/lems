'use client';

import { Stack, Box, Typography, Card, useTheme } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useTranslations } from 'next-intl';
import { TeamWithDivision, Team as AdminTeam } from '@lems/types/api/admin';
import { TeamCard } from './team-card';

interface PreviewStepProps {
  selectedTeam: TeamWithDivision;
  secondaryTeam: AdminTeam;
  isSwap: boolean;
  divisionsCount?: number;
  selectedTeamEvents?: Array<{ id: string; name: string }>;
  secondaryTeamEvents?: Array<{ id: string; name: string }>;
}

export const PreviewStep = ({ selectedTeam, secondaryTeam, isSwap, divisionsCount = 1, selectedTeamEvents = [], secondaryTeamEvents = [] }: PreviewStepProps) => {
  const t = useTranslations('pages.events.teams.edit-teams-preview-modal');
  const theme = useTheme();
  const showDivisions = divisionsCount > 1;

  return (
    <Stack spacing={3}>
      {/* Before/After Comparison */}
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', lg: 'center' }}
      >
        {/* Before Section */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              fontWeight: 700,
              color: 'text.secondary',
              mb: 1.5,
              letterSpacing: 0.5
            }}
          >
            Current State
          </Typography>
          <Stack spacing={1.5}>
            <TeamCard 
              teamData={selectedTeam} 
              label={isSwap ? 'Team 1' : 'Current Team'}
              showDivision={showDivisions}
              seasonEvents={selectedTeamEvents}
            />
            {isSwap && (
              <TeamCard 
                teamData={secondaryTeam} 
                label="Team 2"
                showDivision={showDivisions}
                seasonEvents={secondaryTeamEvents}
              />
            )}
          </Stack>
        </Box>

        {/* Transition Indicator */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: { xs: 'auto', lg: 60 },
            height: { xs: 40, lg: 'auto' },
            mb: { xs: 1, lg: 0 },
            mt: { xs: 0, lg: 3 }
          }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              background: theme.palette.action.hover,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowRightIcon sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
          </Box>
        </Box>

        {/* After Section */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              fontWeight: 700,
              color: 'success.main',
              mb: 1.5,
              letterSpacing: 0.5
            }}
          >
            New State
          </Typography>
          <Stack spacing={1.5}>
            <TeamCard
              teamData={isSwap ? secondaryTeam : secondaryTeam}
              label={isSwap ? 'Team 1 (swapped)' : 'New Team'}
              isAfter
              showDivision={showDivisions}
              seasonEvents={secondaryTeamEvents}
            />
            {isSwap && (
              <TeamCard 
                teamData={selectedTeam} 
                label="Team 2 (swapped)" 
                isAfter
                showDivision={showDivisions}
                seasonEvents={selectedTeamEvents}
              />
            )}
          </Stack>
        </Box>
      </Stack>

      {/* Impact Section */}
      <Card
        sx={{
          p: 2,
          background: `linear-gradient(135deg, ${theme.palette.info.light}20 0%, ${theme.palette.background.paper} 100%)`,
          border: `1px solid ${theme.palette.info.light}`,
          borderRadius: 1.5
        }}
      >
        <Stack spacing={1}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: 'info.main'
            }}
          >
            Impact Assessment
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            <strong>{t('affected-matches', { count: 3 })}</strong> (Mock data)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {isSwap
              ? 'Both teams will be reassigned to new divisions. Match assignments will be updated.'
              : 'The current team will be replaced. All related matches will be reassigned.'}
          </Typography>
        </Stack>
      </Card>
    </Stack>
  );
};

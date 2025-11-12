'use client';

import { useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import { Box, Stack, useTheme } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import {
  GET_DIVISION_TEAMS,
  TEAM_ARRIVED_MUTATION,
  type Team,
  parseDivisionTeams,
  createTeamArrivalSubscription,
  createTeamArrivedCacheUpdate
} from './pit-admin.graphql';
import { PageHeader } from './components/page-header';
import { TeamArrivalInput } from './components/team-arrival-input';
import { ArrivalsStats } from './components/arrivals-stats';

export default function PitAdminPage() {
  const theme = useTheme();
  const { eventName, currentDivision } = useEvent();
  const [teamArrivedMutation] = useMutation(TEAM_ARRIVED_MUTATION);

  const subscriptions = useMemo(
    () => [createTeamArrivalSubscription(currentDivision.id)],
    [currentDivision.id]
  );

  const { data: pageData, loading } = usePageData(
    GET_DIVISION_TEAMS,
    { divisionId: currentDivision.id },
    parseDivisionTeams,
    subscriptions
  );

  const teams = pageData || [];

  const handleTeamArrival = async (team: Team) => {
    await teamArrivedMutation({
      variables: { teamId: team.id, divisionId: currentDivision.id },
      update: createTeamArrivedCacheUpdate(team.id)
    });
  };

  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100vh',
        bgcolor:
          theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[50],
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <PageHeader eventName={eventName} divisionName={currentDivision.name} />

      <Stack
        component="main"
        spacing={3}
        sx={{
          flex: 1,
          py: { xs: 2, sm: 3, md: 4 },
          maxWidth: '1200px',
          width: '100%',
          mx: 'auto'
        }}
      >
        <ArrivalsStats teams={teams} loading={loading} />

        <TeamArrivalInput
          teams={teams}
          onTeamArrival={handleTeamArrival}
          loading={loading}
          disabled={loading}
        />
      </Stack>
    </Box>
  );
}

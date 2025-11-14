'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { Stack } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import {
  GET_DIVISION_TEAMS,
  TEAM_ARRIVED_MUTATION,
  type Team,
  parseDivisionTeams,
  createTeamArrivalSubscription,
  createTeamArrivedCacheUpdate
} from './pit-admin.graphql';
import { TeamArrivalInput } from './components/team-arrival-input';
import { ArrivalsStats } from './components/arrivals-stats';

export default function PitAdminPage() {
  const t = useTranslations('pages.pit-admin');

  const { currentDivision } = useEvent();
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
    <>
      <PageHeader title={t('page-title')} />

      <Stack spacing={3} sx={{ pt: 3 }}>
        <TeamArrivalInput
          teams={teams}
          onTeamArrival={handleTeamArrival}
          loading={loading}
          disabled={loading}
        />

        <ArrivalsStats teams={teams} loading={loading} />
      </Stack>
    </>
  );
}

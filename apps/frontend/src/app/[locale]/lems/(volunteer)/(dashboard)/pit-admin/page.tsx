'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { Stack } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import {
  GET_DIVISION_TEAMS,
  UPDATE_TEAM_ARRIVAL_MUTATION,
  type Team,
  parseDivisionTeams,
  createTeamArrivalSubscription,
  createTeamArrivalCacheUpdate
} from './graphql';
import { TeamArrivalInput } from './components/team-arrival-input';
import { ArrivalsStats } from './components/arrivals-stats';

export default function PitAdminPage() {
  const t = useTranslations('pages.pit-admin');

  const { currentDivision } = useEvent();
  const [updateTeamArrivalMutation] = useMutation(UPDATE_TEAM_ARRIVAL_MUTATION, {
    onError: () => {
      toast.error(t('error'));
    }
  });

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

  const updateTeamArrival = useCallback(
    async (team: Team, arrived: boolean) => {
      await updateTeamArrivalMutation({
        variables: { teamId: team.id, divisionId: currentDivision.id, arrived },
        update: createTeamArrivalCacheUpdate(team.id, arrived)
      });
    },
    [updateTeamArrivalMutation, currentDivision.id]
  );

  const handleTeamArrival = useCallback(
    (team: Team) => updateTeamArrival(team, true),
    [updateTeamArrival]
  );

  const handleTeamNotArrival = useCallback(
    (team: Team) => updateTeamArrival(team, false),
    [updateTeamArrival]
  );

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

        <ArrivalsStats teams={teams} onTeamNotArrival={handleTeamNotArrival} loading={loading} />
      </Stack>
    </>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { useSuspenseQuery } from '@apollo/client/react';
import { redirect, useParams } from 'next/navigation';
import { useEvent } from '../../../components/event-context';
import { useUser } from '../../../components/user-context';
import { TeamProvider } from './components/team-context';
import { GET_TEAM_DATA_QUERY } from './graphql';

interface TeamLayoutProps {
  children: React.ReactNode;
}

export default function TeamLayout({ children }: TeamLayoutProps) {
  const t = useTranslations('layouts.team');

  const params = useParams();
  const teamSlug = params.teamSlug as string;
  const { currentDivision } = useEvent();
  const { role } = useUser();

  const { data, error } = useSuspenseQuery(GET_TEAM_DATA_QUERY, {
    variables: { divisionId: currentDivision.id, teamSlug }
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.division?.teams || data.division.teams.length === 0) {
    toast.error(t('error-not-found'));
    redirect(`/lems/${role}`);
  }

  const team = data.division.teams[0];

  if (!team.arrived) {
    toast.error(t('error-not-arrived'));
    redirect(`/lems/${role}`);
  }

  return <TeamProvider team={team}>{children}</TeamProvider>;
}

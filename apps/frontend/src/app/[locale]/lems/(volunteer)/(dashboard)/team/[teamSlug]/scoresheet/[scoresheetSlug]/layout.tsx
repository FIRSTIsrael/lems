'use client';

import { redirect, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { useSuspenseQuery } from '@apollo/client/react';
import { useUser } from '../../../../../../components/user-context';
import { authorizeUserRole } from '../../../../../../lib/role-authorizer';
import { useEvent } from '../../../../../components/event-context';
import { useTeam } from '../../components/team-context';
import {
  GET_TEAM_MATCH_QUERY,
  type GetTeamMatchQueryData,
  type GetTeamMatchQueryVars,
  type MatchData
} from './layout.graphql';

const parseScoresheetSlug = (scoresheetSlug: string) => {
  const stageInitial = scoresheetSlug.charAt(0);
  if (stageInitial !== 'P' && stageInitial !== 'R') {
    throw new Error('Invalid scoresheet slug');
  }

  const stage = stageInitial === 'P' ? 'PRACTICE' : 'RANKING';
  const round = parseInt(scoresheetSlug.slice(1), 10);
  return { stage, round };
};

interface ScoresheetLayoutProps {
  children: React.ReactNode;
}

export default function ScoresheetLayout({ children }: ScoresheetLayoutProps) {
  const t = useTranslations('layouts.scoresheet');

  const user = useUser();
  const { currentDivision } = useEvent();
  const { scoresheetSlug } = useParams();
  const { stage, round } = parseScoresheetSlug(scoresheetSlug as string);

  const { id: teamId } = useTeam();

  const { data, error } = useSuspenseQuery<GetTeamMatchQueryData, GetTeamMatchQueryVars>(
    GET_TEAM_MATCH_QUERY,
    {
      variables: {
        divisionId: currentDivision.id,
        stage,
        round,
        teamId
      }
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  const authorized = authorizeUserRole(user, ['referee', 'head-referee']);
  if (!authorized) return null;

  const match = data.division?.field?.matches[0] as MatchData | undefined;

  if (!match) {
    toast.error(t('error-match-not-found'));
    redirect(`/lems/${user.role}`);
  }

  if (match.status !== 'completed') {
    toast.error(t('error-match-not-completed'));
    redirect(`/lems/${user.role}`);
  }

  const teamInMatch = match.participants.find(p => p.team?.id === teamId);
  if (!teamInMatch) {
    throw new Error('Team not found in match participants'); // Should never happen
  }

  // Check if referee is assigned to this table
  const assignedTableId = user.roleInfo?.['tableId'];
  if (assignedTableId && assignedTableId !== teamInMatch.table.id) {
    toast.error(t('error-not-assigned-to-table'));
    redirect(`/lems/${user.role}`);
  }

  return <>{children}</>;
}

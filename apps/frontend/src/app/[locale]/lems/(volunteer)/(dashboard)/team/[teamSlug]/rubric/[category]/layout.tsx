'use client';

import { redirect, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { useSuspenseQuery } from '@apollo/client/react';
import { useUser } from '../../../../../components/user-context';
import { authorizeUserRole } from '../../../../../../lib/role-authorizer';
import { useEvent } from '../../../../../components/event-context';
import { useTeam } from '../../components/team-context';
import { GET_TEAM_SESSION_QUERY } from './graphql';

interface RubricLayoutProps {
  children: React.ReactNode;
}

export default function RubricLayout({ children }: RubricLayoutProps) {
  const t = useTranslations('layouts.rubric');

  const user = useUser();
  const { currentDivision } = useEvent();
  const { category } = useParams();

  const { id } = useTeam();

  const { data, error } = useSuspenseQuery(GET_TEAM_SESSION_QUERY, {
    variables: { divisionId: currentDivision.id, teamId: id }
  });

  if (error) {
    throw new Error(error.message);
  }

  const JudgingCategories = new Set(['core-values', 'robot-design', 'innovation-project']);
  if (!category || typeof category !== 'string' || !JudgingCategories.has(category)) {
    throw new Error('Invalid judging category');
  }

  const authorized = authorizeUserRole(user, ['judge', 'lead-judge', 'judge-advisor']);
  if (!authorized) return null;

  const userCategory = user.roleInfo?.['category'];
  if (userCategory && userCategory !== category) {
    toast.error(t('error-not-authorized'));
    redirect(`/lems/${user.role}`);
  }

  const teamSession = data.division?.judging?.sessions?.[0];

  if (teamSession?.status !== 'completed') {
    toast.error(t('error-team-not-judged'));
    redirect(`/lems/${user.role}`);
  }

  const room = user.roleInfo?.['roomId'];
  if (room && room !== data.division?.judging?.sessions?.[0]?.room.id) {
    toast.error(t('error-not-authorized'));
    redirect(`/lems/${user.role}/rooms/${room}`);
  }

  return <>{children}</>;
}

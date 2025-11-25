'use client';

import { redirect, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { useUser } from '../../../../../../components/user-context';
import { authorizeUserRole } from '../../../../../../lib/role-authorizer';

interface RubricLayoutProps {
  children: React.ReactNode;
}

export default function RubricLayout({ children }: RubricLayoutProps) {
  const t = useTranslations('layouts.rubric');

  const user = useUser();
  const { category } = useParams();

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teamSession: any = null;
  // TODO: Actually verify session status
  // eslint-disable-next-line no-constant-condition, no-constant-binary-expression
  if (false && teamSession?.status !== 'completed') {
    toast.error(t('error-team-not-judged'));
    redirect(`/lems/${user.role}`);
  }

  const room = user.roleInfo?.['roomId'];
  if (room) {
    const teamRoom = null;

    // TODO: Actually verify room assignment
    // eslint-disable-next-line no-constant-condition, no-constant-binary-expression
    if (false && room !== teamRoom) {
      toast.error(t('error-not-authorized'));
      redirect(`/lems/${user.role}/rooms/${room}`);
    }
  }

  return <>{children}</>;
}

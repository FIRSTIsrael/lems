'use client';

import { useVolunteer } from '../volunteer-context';
import { CompletedStepSummary } from './completed-step-summary';

interface CompletedUserStepSummaryProps {
  userId: string;
  label: string;
}

export function CompletedUserStepSummary({ userId, label }: CompletedUserStepSummaryProps) {
  const { volunteerData } = useVolunteer();
  const user = volunteerData?.volunteers.find(v => v.id === userId);

  if (!user) return null;

  return <CompletedStepSummary label={label} value={user.identifier || 'Default'} />;
}

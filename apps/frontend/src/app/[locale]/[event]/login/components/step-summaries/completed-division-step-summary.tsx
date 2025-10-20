'use client';

import { useVolunteer } from '../volunteer-context';
import { CompletedStepSummary } from './completed-step-summary';

interface CompletedDivisionStepSummaryProps {
  divisionId: string;
  label: string;
  onStepClick?: () => void;
}

export function CompletedDivisionStepSummary({
  divisionId,
  label,
  onStepClick
}: CompletedDivisionStepSummaryProps) {
  const { volunteerData } = useVolunteer();
  const division = volunteerData?.divisions.find(d => d.id === divisionId);

  if (!division) return null;

  return (
    <CompletedStepSummary
      label={label}
      value={division.name}
      color={division.color}
      onStepClick={onStepClick}
    />
  );
}

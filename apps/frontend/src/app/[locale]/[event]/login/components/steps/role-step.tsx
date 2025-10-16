'use client';

import { Typography, Autocomplete, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useRoleTranslations } from '@lems/localization';
import { fetchVolunteerRoles } from './role-step.graphql';

interface RoleStepProps {
  value: string;
  isSubmitting: boolean;
  onChange: (value: string) => void;
}

export function RoleStep({ value, isSubmitting, onChange }: RoleStepProps) {
  const t = useTranslations('pages.login');
  const { getRole } = useRoleTranslations();
  const params = useParams();
  const eventSlug = params.event as string;

  const { data: roles } = useSWR(
    `volunteer-roles-${eventSlug}`,
    () => fetchVolunteerRoles(eventSlug),
    { suspense: true, fallbackData: [] }
  );

  return (
    <>
      <Typography variant="body1" color="text.secondary">
        {t('instructions.role')}
      </Typography>
      <Autocomplete
        options={roles}
        value={value || null}
        onChange={(_, newValue) => onChange(newValue || '')}
        renderInput={params => (
          <TextField {...params} label={t('fields.role')} required disabled={isSubmitting} />
        )}
        getOptionLabel={option => getRole(option)}
        disabled={isSubmitting}
      />
    </>
  );
}

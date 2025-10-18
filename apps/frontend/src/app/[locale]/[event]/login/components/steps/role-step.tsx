'use client';

import { Typography, Autocomplete, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useFormikContext } from 'formik';
import useSWR from 'swr';
import { useRoleTranslations } from '@lems/localization';
import { LoginFormValues } from '../../types';
import { fetchVolunteerRoles } from './role-step.graphql';

export function RoleStep() {
  const t = useTranslations('pages.login');
  const { getRole } = useRoleTranslations();
  const params = useParams();
  const eventSlug = params.event as string;
  const { values, isSubmitting, setFieldValue } = useFormikContext<LoginFormValues>();

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
        value={values.role || null}
        onChange={(_, newValue) => setFieldValue('role', newValue || '')}
        renderInput={params => (
          <TextField {...params} label={t('fields.role')} required disabled={isSubmitting} />
        )}
        getOptionLabel={option => getRole(option)}
        disabled={isSubmitting}
      />
    </>
  );
}

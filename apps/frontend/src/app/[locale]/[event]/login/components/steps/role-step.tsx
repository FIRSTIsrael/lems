'use client';

import { Typography, Autocomplete, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useFormikContext } from 'formik';
import useSWR from 'swr';
import { useRoleTranslations } from '@lems/localization';
import { LoginFormValues, LoginStep } from '../../types';
import { NextStepButton } from '../next-step-button';
import { fetchVolunteerRoles, fetchVolunteerByRole } from './role-step.graphql';

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

  const shouldSelectDivision = (divisions: number, volunteers: { divisions: unknown[] }[]) => {
    for (const volunteer of volunteers) {
      if (volunteer.divisions.length < divisions) {
        return true;
      }
    }
    return false;
  };

  const shouldSelectAssociation = () => {
    return false;
  };

  const shouldSelectUser = () => {
    return false;
  };

  const handleNext = async () => {
    if (!values.role) {
      return;
    }

    try {
      // Fetch the volunteer data for the selected role
      const volunteerData = await fetchVolunteerByRole(eventSlug, values.role);
      const totalDivisions = volunteerData.divisions.length;

      if (shouldSelectDivision(totalDivisions, volunteerData.volunteers)) {
        setFieldValue('currentStep', LoginStep.Division);
        return;
      }

      if (shouldSelectAssociation()) {
        setFieldValue('currentStep', LoginStep.Association);
        return;
      }

      if (shouldSelectUser()) {
        setFieldValue('currentStep', LoginStep.User);
        return;
      }

      setFieldValue('currentStep', LoginStep.Password);
    } catch (error) {
      console.error('Error fetching volunteer data:', error);
    }
  };

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
      <NextStepButton onClick={handleNext} />
    </>
  );
}

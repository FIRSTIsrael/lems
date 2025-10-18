'use client';

import { Typography, Autocomplete, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useFormikContext } from 'formik';
import { useRoleTranslations } from '@lems/localization';
import { LoginFormValues, LoginStep } from '../../types';
import { NextStepButton } from '../next-step-button';
import { useVolunteer } from '../volunteer-context';

export function RoleStep() {
  const t = useTranslations('pages.login');
  const { getRole } = useRoleTranslations();
  const { values, isSubmitting, setFieldValue } = useFormikContext<LoginFormValues>();
  const { allRoles, setSelectedRole, volunteerData, needsDivision, needsRoleInfo, needsUser } =
    useVolunteer();

  const handleNext = async () => {
    if (needsDivision) {
      setFieldValue('currentStep', LoginStep.Division);
      return;
    } else if (volunteerData && volunteerData.divisions.length === 1) {
      // If only one division exists, auto-set it
      setFieldValue('divisionId', volunteerData.divisions[0].id);
    }

    if (needsRoleInfo) {
      setFieldValue('currentStep', LoginStep.RoleInfo);
      return;
    }

    if (needsUser) {
      setFieldValue('currentStep', LoginStep.User);
      return;
    }

    setFieldValue('currentStep', LoginStep.Password);
  };

  const handleRoleChange = (_event: React.SyntheticEvent, newValue: string | null) => {
    const role = newValue || '';
    setFieldValue('role', role);
    setSelectedRole(role || null);
  };

  return (
    <>
      <Typography variant="body1" color="text.secondary">
        {t('instructions.role')}
      </Typography>
      <Autocomplete
        options={allRoles}
        value={values.role || null}
        onChange={handleRoleChange}
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

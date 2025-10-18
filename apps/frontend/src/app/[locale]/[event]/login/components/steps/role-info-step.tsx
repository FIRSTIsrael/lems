'use client';

import { Typography, Autocomplete, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useFormikContext } from 'formik';
import { LoginFormValues, LoginStep } from '../../types';
import { useRoleInfoOptions, getRoleInfoType } from '../../hooks/use-role-info-options';
import { NextStepButton } from '../next-step-button';
import { useVolunteer } from '../volunteer-context';

export function RoleInfoStep() {
  const t = useTranslations('pages.login');
  const { values, isSubmitting, setFieldValue } = useFormikContext<LoginFormValues>();
  const { volunteerData, needsUser } = useVolunteer();

  const availableOptions = useRoleInfoOptions(values.divisionId);

  if (!volunteerData) return null;

  if (!values.divisionId) {
    throw new Error('Division ID is required for role info step');
  }

  const roleInfoType = getRoleInfoType(volunteerData.volunteers[0].roleInfo);
  if (!roleInfoType) {
    throw new Error('Role info type could not be determined');
  }

  const selectedOption = availableOptions.find(opt => opt.id === values.roleInfoValue) || null;

  const handleNext = () => {
    setFieldValue('currentStep', needsUser ? LoginStep.User : LoginStep.Password);
  };

  return (
    <>
      <Typography variant="body1" color="text.secondary">
        {t(`instructions.roleInfo-${roleInfoType}`)}
      </Typography>
      <Autocomplete
        options={availableOptions}
        getOptionLabel={option => option.name}
        value={selectedOption}
        onChange={(_, newValue) => {
          setFieldValue('associationValue', newValue?.id || '');
        }}
        renderInput={params => (
          <TextField
            {...params}
            label={t(`fields.${roleInfoType}`)}
            required
            disabled={isSubmitting}
          />
        )}
        disabled={isSubmitting}
      />
      <NextStepButton onClick={handleNext} />
    </>
  );
}

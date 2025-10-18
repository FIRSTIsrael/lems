'use client';

import { Typography, Autocomplete, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useFormikContext } from 'formik';
import { LoginFormValues, LoginStep } from '../../types';
import { NextStepButton } from '../next-step-button';
import { useVolunteer } from '../volunteer-context';

export function UserStep() {
  const t = useTranslations('pages.login');
  const { values, isSubmitting, setFieldValue } = useFormikContext<LoginFormValues>();
  const { volunteerData } = useVolunteer();

  if (!volunteerData) {
    return null;
  }

  const selectedVolunteer = volunteerData.volunteers.find(v => v.id === values.userId) || null;

  const handleNext = async () => {
    setFieldValue('currentStep', LoginStep.Password);
  };

  return (
    <>
      <Typography variant="body1" color="text.secondary">
        {t('instructions.user')}
      </Typography>
      <Autocomplete
        options={volunteerData.volunteers}
        getOptionLabel={option => option.identifier || 'Default'}
        value={selectedVolunteer}
        onChange={(_, newValue) => {
          setFieldValue('userId', newValue?.id || '');
        }}
        renderInput={params => (
          <TextField {...params} label={t('fields.user')} required disabled={isSubmitting} />
        )}
        disabled={isSubmitting}
      />
      <NextStepButton onClick={handleNext} />
    </>
  );
}

'use client';

import { Typography, Autocomplete, TextField, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useFormikContext } from 'formik';
import { LoginFormValues, LoginStep } from '../../types';
import { NextStepButton } from '../next-step-button';
import { useVolunteer } from '../volunteer-context';

export function DivisionStep() {
  const t = useTranslations('pages.login');
  const { values, isSubmitting, setFieldValue } = useFormikContext<LoginFormValues>();
  const { volunteerData, needsRoleInfo, needsUser } = useVolunteer();

  if (!volunteerData) {
    return null;
  }

  const divisionsWithVolunteers = new Set(
    volunteerData.volunteers.flatMap(v => v.divisions.map(d => d.id))
  );

  const availableDivisions = volunteerData.divisions.filter(d => divisionsWithVolunteers.has(d.id));

  const selectedDivision = availableDivisions.find(d => d.id === values.divisionId) || null;

  const handleNext = async () => {
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

  const handleDivisionChange = (
    _event: React.SyntheticEvent,
    newValue: (typeof availableDivisions)[0] | null
  ) => {
    setFieldValue('divisionId', newValue?.id || '');
  };

  return (
    <>
      <Typography variant="body1" color="text.secondary">
        {t('instructions.division')}
      </Typography>
      <Autocomplete
        options={availableDivisions}
        getOptionLabel={option => option.name}
        value={selectedDivision}
        onChange={handleDivisionChange}
        renderInput={params => (
          <TextField {...params} label={t('fields.division')} required disabled={isSubmitting} />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: option.color,
                flexShrink: 0
              }}
            />
            {option.name}
          </Box>
        )}
        disabled={isSubmitting}
      />
      <NextStepButton onClick={handleNext} />
    </>
  );
}

'use client';

import { Typography, Autocomplete, TextField, Box, Paper, alpha } from '@mui/material';
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

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: 'primary.main'
        }}
      >
        {t('steps.division')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
        {t('instructions.division')}
      </Typography>
      <Autocomplete
        options={availableDivisions}
        getOptionLabel={option => option.name}
        value={selectedDivision}
        onChange={(_, newValue) => {
          setFieldValue('divisionId', newValue?.id || '');
        }}
        renderInput={params => (
          <TextField
            {...params}
            label={t('fields.division')}
            required
            disabled={isSubmitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: theme => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`
                },
                '&.Mui-focused': {
                  boxShadow: theme => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`
                }
              }
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: theme => alpha(theme.palette.primary.main, 0.08)
              }
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: option.color,
                flexShrink: 0,
                boxShadow: `0 0 0 2px ${alpha(option.color, 0.2)}`
              }}
            />
            <Typography variant="body1">{option.name}</Typography>
          </Box>
        )}
        disabled={isSubmitting}
        PaperComponent={({ children, ...props }) => (
          <Paper
            {...props}
            elevation={8}
            sx={{
              mt: 1,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            {children}
          </Paper>
        )}
        sx={{ mb: 3 }}
      />
      <NextStepButton onClick={handleNext} />
    </Box>
  );
}

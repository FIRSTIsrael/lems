'use client';

import { Typography, Autocomplete, TextField, Box, Paper, alpha } from '@mui/material';
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
    <Box>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: 'primary.main'
        }}
      >
        {t('steps.role')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
        {t('instructions.role')}
      </Typography>
      <Autocomplete
        options={allRoles}
        value={values.role || null}
        onChange={handleRoleChange}
        renderInput={params => (
          <TextField
            {...params}
            label={t('fields.role')}
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
        getOptionLabel={option => getRole(option)}
        disabled={isSubmitting}
        slots={{
          paper: ({ children, ...props }) => (
            <Paper {...props} elevation={8} sx={{ mt: 1, borderRadius: 2, overflow: 'hidden' }}>
              {children}
            </Paper>
          )
        }}
        sx={{ mb: 3 }}
      />
      <NextStepButton onClick={handleNext} />
    </Box>
  );
}

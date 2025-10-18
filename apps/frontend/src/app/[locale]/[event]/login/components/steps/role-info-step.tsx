'use client';

import { Typography, Autocomplete, TextField, Box, Paper, alpha } from '@mui/material';
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
    <Box>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: 'primary.main'
        }}
      >
        {t('steps.association')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
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

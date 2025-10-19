'use client';

import { Typography, Autocomplete, TextField, Box, Paper, alpha } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useFormikContext } from 'formik';
import { LoginFormValues, LoginStep } from '../../types';
import { NextStepButton } from '../next-step-button';
import { useUserOptions } from '../../hooks/use-user-options';

export function UserStep() {
  const t = useTranslations('pages.login');
  const { values, isSubmitting, setFieldValue } = useFormikContext<LoginFormValues>();

  const options = useUserOptions(values.divisionId);
  if (!options) return null;

  const selectedVolunteer = options.find(v => v.id === values.userId) || null;

  const handleNext = async () => {
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
        {t('steps.user')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
        {t('instructions.user')}
      </Typography>
      <Autocomplete
        options={options}
        getOptionLabel={option => option.identifier || 'Default'}
        value={selectedVolunteer}
        onChange={(_, newValue) => {
          setFieldValue('userId', newValue?.id || '');
        }}
        renderInput={params => (
          <TextField
            {...params}
            label={t('fields.user')}
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
        slots={{
          paper: ({ children, ...props }) => (
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
          )
        }}
        sx={{ mb: 3 }}
      />
      <NextStepButton onClick={handleNext} />
    </Box>
  );
}

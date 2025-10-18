'use client';

import { useTranslations } from 'next-intl';
import { useFormikContext } from 'formik';
import { Box, Button } from '@mui/material';
import { LoginFormValues, LoginStep } from '../types';

export function NextStepButton() {
  const t = useTranslations('pages.login');

  const { values, isValid, isSubmitting, setFieldValue } = useFormikContext<LoginFormValues>();
  const isFinalStep = values.currentStep === LoginStep.Password;

  const handleClick = () => {
    if (isFinalStep) {
      // Submit the form
    } else {
      setFieldValue('currentStep', values.currentStep + 1);
    }
  };

  return (
    <Box display="flex" justifyContent="center" width="100%">
      <Button
        type={isFinalStep ? 'submit' : 'button'}
        variant="contained"
        size="large"
        disabled={isSubmitting || !isValid}
        loading={isSubmitting}
        sx={{ borderRadius: 2, py: 1.5, width: '50%' }}
        onClick={handleClick}
      >
        {isSubmitting ? t('submitting') : t('continue')}
      </Button>
    </Box>
  );
}

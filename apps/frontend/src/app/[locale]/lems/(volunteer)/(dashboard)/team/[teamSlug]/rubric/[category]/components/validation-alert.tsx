'use client';

import React, { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { useRubric } from '../rubric-context';
import { getValidationErrorMessage } from '../rubric-validation';

export const ValidationAlert: React.FC = () => {
  const t = useTranslations('pages.rubric');
  const { validation } = useRubric();

  const handleClick = useCallback(() => {
    if (validation.invalidFieldId) {
      const element = document.getElementById(`field-${validation.invalidFieldId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  }, [validation.invalidFieldId]);

  if (validation.isValid || !validation.error) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Alert
        severity="warning"
        action={
          <Button color="inherit" size="small" onClick={handleClick}>
            {t('validation.show')}
          </Button>
        }
      >
        <AlertTitle>{t('validation.title')}</AlertTitle>
        {getValidationErrorMessage(validation.error, (key: string) => t(key))}
      </Alert>
    </Box>
  );
};

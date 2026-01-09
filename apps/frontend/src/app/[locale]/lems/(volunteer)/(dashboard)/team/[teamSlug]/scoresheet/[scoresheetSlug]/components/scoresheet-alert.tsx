'use client';

import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { ScoresheetValidationResult } from '../scoresheet-validation';

interface ScoresheetIncompleteAlertProps {
  validation: ScoresheetValidationResult;
}

export const ScoresheetIncompleteAlert: React.FC<ScoresheetIncompleteAlertProps> = ({
  validation
}) => {
  const t = useTranslations('layouts.scoresheet');

  const hasMissionErrors = Array.from(validation.missionErrors.values()).some(
    m => !m.isComplete || m.errors.length > 0
  );

  if (!hasMissionErrors || validation.isComplete) {
    return null;
  }

  const handleClick = () => {
    const targetMissionId = validation.firstErrorMissionId || validation.firstIncompleteMissionId;
    if (targetMissionId) {
      const element = document.getElementById(targetMissionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const message = validation.firstErrorMissionId
    ? t('incomplete-with-errors')
    : t('incomplete-message');

  return (
    <Alert
      severity="warning"
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: 'warning.lighter'
        }
      }}
      onClick={handleClick}
    >
      <AlertTitle>{t('incomplete-title')}</AlertTitle>
      <Typography variant="body2">{message}</Typography>
      <Box mt={1} color="inherit" fontSize="0.875rem" fontWeight={500}>
        {t('incomplete-action')}
      </Box>
    </Alert>
  );
};

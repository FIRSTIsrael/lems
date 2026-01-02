'use client';

import { Alert, Box, IconButton, Typography } from '@mui/material';
import { CheckCircle, Info, Warning } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface MissingInfoAlertProps {
  isFullySetUp: boolean;
  hasDetailedData: boolean;
  missingItemsCount: number;
  onShowDetails?: () => void;
}

export const MissingInfoAlert: React.FC<MissingInfoAlertProps> = ({
  isFullySetUp,
  hasDetailedData,
  missingItemsCount,
  onShowDetails
}) => {
  const t = useTranslations('pages.events.missing-info');

  if (isFullySetUp) {
    return (
      <Alert severity="success" icon={<CheckCircle />} sx={{ py: 0.5 }}>
        {t('fully-set-up')}
      </Alert>
    );
  }

  if (!hasDetailedData) {
    return (
      <Alert
        severity="warning"
        icon={<Warning />}
        sx={{ py: 0.5 }}
        action={
          onShowDetails && (
            <IconButton
              color="inherit"
              size="small"
              onClick={onShowDetails}
              aria-label={t('show-details')}
            >
              <Info />
            </IconButton>
          )
        }
      >
        <Typography variant="body2">{t('missing-details')}</Typography>
      </Alert>
    );
  }

  return (
    <Alert
      severity="warning"
      icon={<Warning />}
      sx={{ py: 0.5 }}
      action={
        onShowDetails && (
          <IconButton
            color="inherit"
            size="small"
            onClick={onShowDetails}
            aria-label={t('show-details')}
          >
            <Info />
          </IconButton>
        )
      }
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">
          {t('missing-details-count', { count: missingItemsCount })}
        </Typography>
      </Box>
    </Alert>
  );
};

'use client';

import { Alert, IconButton, Typography } from '@mui/material';
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
  const tCard = useTranslations('pages.events.card');

  if (isFullySetUp) {
    return (
      <Alert severity="success" icon={<CheckCircle />} sx={{ py: 0.5 }}>
        {tCard('fully-set-up')}
      </Alert>
    );
  }

  const infoButton = onShowDetails && (
    <IconButton color="inherit" size="small" onClick={onShowDetails} aria-label={t('show-details')}>
      <Info />
    </IconButton>
  );

  return (
    <Alert severity="warning" icon={<Warning />} sx={{ py: 0.5 }} action={infoButton}>
      <Typography variant="body2">
        {!hasDetailedData
          ? tCard('missing-details')
          : t('missing-details-count', { count: missingItemsCount })}
      </Typography>
    </Alert>
  );
};

'use client';

import { Alert, Box, IconButton, Typography } from '@mui/material';
import { CheckCircle, ExpandLess, ExpandMore, Warning } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface MissingInfoAlertProps {
  isFullySetUp: boolean;
  hasDetailedData: boolean;
  missingItemsCount: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  onShowDetails?: () => void;
}

export const MissingInfoAlert: React.FC<MissingInfoAlertProps> = ({
  isFullySetUp,
  hasDetailedData,
  missingItemsCount,
  expanded,
  onToggleExpanded,
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

  // If we don't have detailed data, show simple message with option to load details
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
              <ExpandMore />
            </IconButton>
          )
        }
      >
        <Typography variant="body2">{t('missing-details')}</Typography>
      </Alert>
    );
  }

  // Show detailed missing items count with expand/collapse
  return (
    <Alert
      severity="warning"
      icon={<Warning />}
      sx={{ py: 0.5 }}
      action={
        <IconButton
          color="inherit"
          size="small"
          onClick={onToggleExpanded}
          aria-label={expanded ? t('hide-details') : t('show-details')}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
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

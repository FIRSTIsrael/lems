'use client';

import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { VideogameAssetRounded } from '@mui/icons-material';
import { useScorekeeperData } from '../scorekeeper-context';

export const TestMatchButton = () => {
  const t = useTranslations('pages.scorekeeper.controls');
  const { activeMatch } = useScorekeeperData();

  const hasActiveMatch = !!activeMatch;
  const isDisabled = hasActiveMatch;

  return (
    <Button
      variant="outlined"
      size="small"
      fullWidth
      disabled={isDisabled}
      onClick={() => console.log('Start test match')}
      startIcon={<VideogameAssetRounded sx={{ fontSize: '1.1rem' }} />}
      sx={{ py: 0.75, fontSize: '0.875rem', fontWeight: 500 }}
    >
      {t('test-match')}
    </Button>
  );
};

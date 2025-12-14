'use client';

import { Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { VideogameAssetRounded } from '@mui/icons-material';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { START_MATCH_MUTATION } from '../../graphql';
import { useScorekeeperData } from '../scorekeeper-context';
import { useEvent } from '../../../../components/event-context';

export const TestMatchButton = () => {
  const t = useTranslations('pages.scorekeeper.controls');
  const { activeMatch, testMatch } = useScorekeeperData();
  const { currentDivision } = useEvent();

  const [startMatch] = useMutation(START_MATCH_MUTATION, {
    onError: () => {
      toast.error(t('start-error'));
    }
  });

  const hasActiveMatch = !!activeMatch;
  const isDisabled = hasActiveMatch || !testMatch;

  const handleStartTestMatch = () => {
    if (testMatch) {
      startMatch({
        variables: { divisionId: currentDivision.id, matchId: testMatch.id }
      });
    }
  };

  return (
    <Button
      variant="outlined"
      size="small"
      fullWidth
      disabled={isDisabled}
      onClick={handleStartTestMatch}
      startIcon={<VideogameAssetRounded sx={{ fontSize: '1.1rem' }} />}
      sx={{ py: 0.75, fontSize: '0.875rem', fontWeight: 500 }}
    >
      {t('test-match')}
    </Button>
  );
};

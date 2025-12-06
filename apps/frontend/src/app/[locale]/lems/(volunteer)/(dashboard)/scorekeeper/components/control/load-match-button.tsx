'use client';

import { useTranslations } from 'next-intl';
import { Button, Tooltip } from '@mui/material';
import { StartRounded } from '@mui/icons-material';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { useScorekeeperData } from '../scorekeeper-context';
import { LOAD_MATCH_MUTATION } from '../../scorekeeper.graphql';
import { useEvent } from '../../../../components/event-context';

export const LoadMatchButton = () => {
  const t = useTranslations('pages.scorekeeper.controls');

  const { nextMatch: matchToLoad } = useScorekeeperData();
  const { currentDivision } = useEvent();

  const [loadMatch] = useMutation(LOAD_MATCH_MUTATION, {
    onError: () => {
      toast.error(t('load-error'));
    }
  });

  return (
    <Tooltip title={t('load-next')}>
      <Button
        variant="outlined"
        size="small"
        fullWidth
        disabled={!matchToLoad}
        onClick={() =>
          loadMatch({
            variables: { divisionId: currentDivision.id, matchId: matchToLoad!.id }
          })
        }
        startIcon={<StartRounded sx={{ fontSize: '1.1rem' }} />}
        sx={{ py: 0.75, fontSize: '0.875rem', fontWeight: 500 }}
      >
        {t('load-next')}
      </Button>
    </Tooltip>
  );
};

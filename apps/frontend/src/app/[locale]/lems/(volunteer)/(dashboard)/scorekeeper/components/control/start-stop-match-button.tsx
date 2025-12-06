'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { PlayArrowRounded, StopRounded } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import { useTime } from '../../../../../../../../lib/time/hooks';
import { useScorekeeperData } from '../scorekeeper-context';
import { START_MATCH_MUTATION } from '../../scorekeeper.graphql';
import { useEvent } from '../../../../components/event-context';

export const StartStopMatchButton = () => {
  const t = useTranslations('pages.scorekeeper.controls');
  const currentTime = useTime({ interval: 1000 });
  const [abortDialogOpen, setAbortDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loadedMatch, activeMatch } = useScorekeeperData();
  const { currentDivision } = useEvent();

  const [startMatch] = useMutation(START_MATCH_MUTATION, {
    onError: () => {
      toast.error(t('start-error'));
    }
  });

  const hasActiveMatch = !!activeMatch;
  const hasLoadedMatch = !!loadedMatch;

  const minutesUntilStart = loadedMatch
    ? dayjs(loadedMatch.scheduledTime).diff(currentTime, 'minute', true)
    : Infinity;

  const canStart = hasLoadedMatch && !hasActiveMatch && minutesUntilStart <= 5;

  const handleAbortClick = () => {
    setAbortDialogOpen(true);
  };

  const handleAbortConfirm = async () => {
    setAbortDialogOpen(false);
    setIsSubmitting(true);
    try {
      console.log('Abort match');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartMatch = async () => {
    setIsSubmitting(true);
    try {
      if (hasLoadedMatch) {
        await startMatch({
          variables: { divisionId: currentDivision.id, matchId: loadedMatch.id }
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color={hasActiveMatch ? 'error' : 'success'}
        size="large"
        fullWidth
        disabled={isSubmitting || !canStart}
        onClick={hasActiveMatch ? handleAbortClick : handleStartMatch}
        startIcon={hasActiveMatch ? <StopRounded /> : <PlayArrowRounded />}
        sx={{ py: 1.25, fontSize: '1rem', fontWeight: 600 }}
      >
        {hasActiveMatch ? t('abort-match') : t('start-match')}
      </Button>

      <Dialog
        open={abortDialogOpen}
        onClose={() => setAbortDialogOpen(false)}
        aria-labelledby="abort-dialog-title"
      >
        <DialogTitle id="abort-dialog-title" sx={{ fontWeight: 600 }}>
          {t('abort-confirm-title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary', mt: 1 }}>
            {t('abort-confirm-message')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setAbortDialogOpen(false)}
            variant="outlined"
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleAbortConfirm}
            variant="contained"
            color="error"
            disabled={isSubmitting}
          >
            {t('confirm-abort')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

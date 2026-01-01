'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Paper, Stack, Button, CircularProgress } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useScoresheet } from '../scoresheet-context';
import { useEvent } from '../../../../../../components/event-context';
import { useUser } from '../../../../../../../components/user-context';
import { UPDATE_SCORESHEET_ESCALATED_MUTATION, RESET_SCORESHEET_MUTATION } from '../graphql';

export const ScoresheetActions: React.FC = () => {
  const t = useTranslations('pages.scoresheet');
  const { scoresheet } = useScoresheet();
  const { currentDivision } = useEvent();
  const user = useUser();

  const [isEscalating, setIsEscalating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const isHeadReferee = user.role === 'head-referee';
  const isReferee = user.role === 'referee';
  const isEscalated = scoresheet.escalated || false;

  // Determine button states
  const showResetButton = isHeadReferee;
  const showEscalateButton = isReferee || isHeadReferee;
  const escalateButtonDisabled = isReferee && isEscalated;

  const [updateEscalated] = useMutation(UPDATE_SCORESHEET_ESCALATED_MUTATION, {
    onError: error => {
      console.error('Failed to update escalation:', error);
      toast.error(t('error-failed-to-escalate'));
    }
  });

  const [resetScoresheet] = useMutation(RESET_SCORESHEET_MUTATION, {
    onError: error => {
      console.error('Failed to reset scoresheet:', error);
      toast.error(t('error-failed-to-reset'));
    }
  });

  const handleEscalate = async () => {
    setIsEscalating(true);
    try {
      await updateEscalated({
        variables: {
          divisionId: currentDivision.id,
          scoresheetId: scoresheet.id,
          escalated: !isEscalated
        }
      });
      toast.success(isEscalated ? t('de-escalated-success') : t('escalated-success'));
    } finally {
      setIsEscalating(false);
    }
  };

  const handleReset = async () => {
    // Confirmation dialog
    if (!confirm(t('confirm-reset'))) {
      return;
    }

    setIsResetting(true);
    try {
      await resetScoresheet({
        variables: {
          divisionId: currentDivision.id,
          scoresheetId: scoresheet.id
        }
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Don't show the component if no buttons should be displayed
  if (!showEscalateButton && !showResetButton) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        {showEscalateButton && (
          <Button
            variant={isEscalated && isHeadReferee ? 'outlined' : 'contained'}
            color={isEscalated && isHeadReferee ? 'warning' : 'primary'}
            disabled={escalateButtonDisabled || isEscalating}
            onClick={handleEscalate}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 150
            }}
          >
            {isEscalating ? (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress size={20} color="inherit" />
                {t('processing')}
              </Stack>
            ) : isEscalated && isHeadReferee ? (
              t('de-escalate')
            ) : (
              t('escalate')
            )}
          </Button>
        )}

        {showResetButton && (
          <Button
            variant="outlined"
            color="error"
            disabled={isResetting}
            onClick={handleReset}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 150
            }}
          >
            {isResetting ? (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress size={20} color="inherit" />
                {t('processing')}
              </Stack>
            ) : (
              t('reset')
            )}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

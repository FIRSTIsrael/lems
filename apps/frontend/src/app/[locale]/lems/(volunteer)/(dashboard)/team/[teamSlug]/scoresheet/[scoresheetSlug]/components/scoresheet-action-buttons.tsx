'use client';

import { useTranslations } from 'next-intl';
import { Stack, Button, CircularProgress } from '@mui/material';
import { useScoresheet } from '../scoresheet-context';
import { useUser } from '../../../../../../components/user-context';

interface ScoresheetActionButtonsProps {
  isSigned: boolean;
  isLoading: boolean;
  onEscalate: () => void;
  onReset: () => void;
  onSubmit: () => void;
  onSwitchToGP?: () => void;
}

export const ScoresheetActionButtons: React.FC<ScoresheetActionButtonsProps> = ({
  isSigned,
  isLoading,
  onEscalate,
  onReset,
  onSubmit,
  onSwitchToGP
}) => {
  const t = useTranslations('pages.scoresheet');
  const { scoresheet, forceEdit, viewMode } = useScoresheet();
  const user = useUser();

  const isHeadReferee = user.role === 'head-referee';
  const isReferee = user.role === 'referee';
  const isEscalated = scoresheet.escalated || false;
  const isSubmitted = scoresheet.status === 'submitted';
  const hasSignature = !!scoresheet.data.signature;

  const showResetButton = isHeadReferee;
  const showEscalateButton = (isReferee && !isEscalated) || isHeadReferee;

  // Disable escalate and reset buttons if submitted (unless forceEdit)
  const escalateDisabled = isSubmitted && !forceEdit;
  const resetDisabled = isSubmitted && !forceEdit;

  // Button text and behavior when signature exists
  const shouldSwitchToGP = hasSignature && viewMode === 'score';
  const submitButtonText = shouldSwitchToGP ? t('gp-next') : t('submit-scoresheet');
  const submitButtonHandler = shouldSwitchToGP ? onSwitchToGP : onSubmit;

  return (
    <Stack direction="row" spacing={2} justifyContent="flex-end">
      {showEscalateButton && (
        <Button
          variant={isEscalated && isHeadReferee ? 'outlined' : 'contained'}
          color={isEscalated && isHeadReferee ? 'warning' : 'primary'}
          disabled={escalateDisabled || isLoading}
          onClick={onEscalate}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            minWidth: 150
          }}
        >
          {isLoading ? (
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
          disabled={resetDisabled || isLoading}
          onClick={onReset}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            minWidth: 150
          }}
        >
          {isLoading ? (
            <Stack direction="row" alignItems="center" gap={1}>
              <CircularProgress size={20} color="inherit" />
              {t('processing')}
            </Stack>
          ) : (
            t('reset')
          )}
        </Button>
      )}

      <Button
        variant="contained"
        size="large"
        disabled={
          isLoading ||
          (!hasSignature && !isSigned) ||
          (hasSignature && !shouldSwitchToGP) ||
          (isSubmitted && !forceEdit)
        }
        onClick={submitButtonHandler}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          py: 1.5,
          minWidth: 150
        }}
      >
        {isLoading ? (
          <Stack direction="row" alignItems="center" gap={1}>
            <CircularProgress size={20} color="inherit" />
            {t('submitting')}
          </Stack>
        ) : (
          submitButtonText
        )}
      </Button>
    </Stack>
  );
};

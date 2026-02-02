'use client';

import { Stack, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { memo, useCallback } from 'react';
import type { SlotInfo } from '../types';
import { SourceType } from '../types';
import { getAllowedActions, ActionType } from '../validation';

interface ActionButtonsProps {
  selectedSlot: SlotInfo | null;
  sourceType: SourceType | null;
  secondSlot: SlotInfo | null;
  onMove: () => void;
  onReplace: () => void;
  onClear: () => void;
  onClose: () => void;
}

const isActionDisabled = (
  actionType: ActionType,
  sourceType: SourceType | null,
  selectedSlot: SlotInfo | null,
  secondSlot: SlotInfo | null
): boolean => {
  if (!secondSlot && actionType !== 'clear') return true;
  if (actionType === 'clear') return !selectedSlot?.team || sourceType !== SourceType.RESCHEDULE;
  return false;
};

export function ActionButtonsComponent({
  selectedSlot,
  sourceType,
  secondSlot,
  onMove,
  onReplace,
  onClear,
  onClose
}: ActionButtonsProps) {
  const t = useTranslations('pages.tournament-manager');
  const allowedActions = getAllowedActions(sourceType);
  const isJudgingSession = selectedSlot?.type === 'session';

  const handleMoveClick = useCallback(() => {
    onMove();
  }, [onMove]);

  const handleReplaceClick = useCallback(() => {
    onReplace();
  }, [onReplace]);

  const handleClearClick = useCallback(() => {
    onClear();
  }, [onClear]);

  const handleCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Stack spacing={2}>
      {secondSlot && (
        <>
          {isJudgingSession ? (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleReplaceClick}
                disabled={isActionDisabled('replace', sourceType, selectedSlot, secondSlot)}
                fullWidth
              >
                {t('actions.replace')}
              </Button>
              <Button variant="outlined" fullWidth onClick={handleCloseClick}>
                {t('actions.cancel')}
              </Button>
            </>
          ) : (
            <>
              <Stack direction="row" spacing={1}>
                {sourceType === SourceType.REMATCH ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleMoveClick}
                    disabled={isActionDisabled('move', sourceType, selectedSlot, secondSlot)}
                    fullWidth
                  >
                    {t('actions.insert-rematch')}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleMoveClick}
                      disabled={isActionDisabled('move', sourceType, selectedSlot, secondSlot)}
                      fullWidth
                    >
                      {t('actions.move')}
                    </Button>
                    {allowedActions.includes('replace') && (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleReplaceClick}
                        disabled={isActionDisabled('replace', sourceType, selectedSlot, secondSlot)}
                        fullWidth
                      >
                        {t('actions.replace')}
                      </Button>
                    )}
                  </>
                )}
              </Stack>
              <Button variant="outlined" fullWidth onClick={handleCloseClick}>
                {t('actions.cancel')}
              </Button>
            </>
          )}
        </>
      )}

      {!secondSlot && allowedActions.includes('clear') && (
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={handleClearClick}
          disabled={isActionDisabled('clear', sourceType, selectedSlot, secondSlot)}
        >
          {t('actions.clear')}
        </Button>
      )}
    </Stack>
  );
}

export const ActionButtons = memo(ActionButtonsComponent);

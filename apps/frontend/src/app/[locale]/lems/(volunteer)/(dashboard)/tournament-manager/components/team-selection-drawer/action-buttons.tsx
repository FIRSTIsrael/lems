'use client';

import { Stack, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { memo, useCallback } from 'react';
import type { SlotInfo } from '../types';
import { SourceType } from '../types';
import { useTournamentManager } from '../../context';
import { getAllowedActions } from '../validation';

interface ActionButtonsProps {
  onMove: () => Promise<void>;
  onReplace: () => Promise<void>;
  onClear: () => Promise<void>;
  onClose: () => void;
}

function getIsActionDisabled(
  actionType: 'move' | 'replace' | 'clear',
  sourceType: SourceType | null,
  selectedSlot: SlotInfo | null,
  secondSlot: SlotInfo | null
): boolean {
  if (!secondSlot && actionType !== 'clear') return true;
  if (actionType === 'clear') return !selectedSlot?.team || sourceType !== SourceType.RESCHEDULE;
  if (actionType === 'replace' && secondSlot && !secondSlot.team) return true;
  return false;
}

export function ActionButtonsComponent({
  onMove,
  onReplace,
  onClear,
  onClose
}: ActionButtonsProps) {
  const t = useTranslations('pages.tournament-manager');
  const { selectedSlot, sourceType, secondSlot } = useTournamentManager();
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
              {allowedActions.includes('move') && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleMoveClick}
                  disabled={getIsActionDisabled('move', sourceType, selectedSlot, secondSlot)}
                  fullWidth
                >
                  {t('actions.move')}
                </Button>
              )}
              {allowedActions.includes('replace') && (
                <Button
                  variant="outlined"
                  onClick={handleReplaceClick}
                  disabled={getIsActionDisabled('replace', sourceType, selectedSlot, secondSlot)}
                  fullWidth
                >
                  {t('actions.replace')}
                </Button>
              )}
              <Button variant="outlined" fullWidth onClick={handleCloseClick}>
                {t('actions.cancel')}
              </Button>
            </>
          ) : (
            <>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleMoveClick}
                  disabled={getIsActionDisabled('move', sourceType, selectedSlot, secondSlot)}
                  fullWidth
                >
                  {sourceType === SourceType.REMATCH
                    ? t('actions.insert-rematch')
                    : t('actions.move')}
                </Button>
                {allowedActions.includes('replace') && (
                  <Button
                    variant="outlined"
                    onClick={handleReplaceClick}
                    disabled={getIsActionDisabled('replace', sourceType, selectedSlot, secondSlot)}
                    fullWidth
                  >
                    {t('actions.replace')}
                  </Button>
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
          onClick={handleClearClick}
          disabled={getIsActionDisabled('clear', sourceType, selectedSlot, secondSlot)}
          fullWidth
        >
          {t('actions.clear')}
        </Button>
      )}
    </Stack>
  );
}

export const ActionButtons = memo(ActionButtonsComponent);

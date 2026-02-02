'use client';

import { Stack, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { memo, useCallback } from 'react';
import type { SlotInfo } from '../types';
import type { TournamentManagerData } from '../../graphql';
import {
  isSlotCompleted,
  isSlotInProgress,
  getSlotStatus,
  isSlotCurrentlyLoaded,
  isSlotBlockedAsDestination
} from '../validation';

interface ActionButtonsProps {
  selectedSlot: SlotInfo | null;
  secondSlot: SlotInfo | null;
  division: TournamentManagerData['division'];
  onMove: () => void;
  onReplace: () => void;
  onClear: () => void;
  onClose: () => void;
}

type ActionType = 'move' | 'replace' | 'insert' | 'clear';

const isActionDisabled = (
  actionType: ActionType,
  selectedSlot: SlotInfo | null,
  secondSlot: SlotInfo | null,
  division: TournamentManagerData['division']
): boolean => {
  const sourceStatus = selectedSlot ? getSlotStatus(selectedSlot, division) : null;
  const isSourceLoaded = selectedSlot ? isSlotCurrentlyLoaded(selectedSlot, division) : false;
  const isDestinationLoaded = secondSlot ? isSlotCurrentlyLoaded(secondSlot, division) : false;
  const isDestinationBlocked = secondSlot
    ? isSlotBlockedAsDestination(secondSlot, division)
    : false;

  if (actionType === 'clear') {
    return (
      !selectedSlot?.team ||
      isSlotCompleted(selectedSlot, division) ||
      isSlotInProgress(selectedSlot, division)
    );
  }

  if (!secondSlot) {
    return true;
  }

  if (isSourceLoaded || isDestinationLoaded) {
    return true;
  }

  if (isDestinationBlocked) {
    return true;
  }

  if (actionType === 'insert') {
    return false;
  }

  if (sourceStatus !== 'not-started') {
    return true;
  }

  if (actionType === 'replace' && !secondSlot.team) {
    return true;
  }

  return false;
};

export function ActionButtonsComponent({
  selectedSlot,
  secondSlot,
  division,
  onMove,
  onReplace,
  onClear,
  onClose
}: ActionButtonsProps) {
  const t = useTranslations('pages.tournament-manager');

  const isMoveDisabled = isActionDisabled('move', selectedSlot, secondSlot, division);
  const isReplaceDisabled = isActionDisabled('replace', selectedSlot, secondSlot, division);
  const isInsertDisabled = isActionDisabled('insert', selectedSlot, secondSlot, division);
  const isClearDisabled = isActionDisabled('clear', selectedSlot, secondSlot, division);

  const isSourceCompletedOrInProgress =
    selectedSlot &&
    (isSlotCompleted(selectedSlot, division) || isSlotInProgress(selectedSlot, division));

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
            // For judging sessions: only show replace button (swap sessions)
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleReplaceClick}
                disabled={isReplaceDisabled}
                fullWidth
              >
                {t('actions.replace')}
              </Button>
              <Button variant="outlined" fullWidth onClick={handleCloseClick}>
                {t('actions.cancel')}
              </Button>
            </>
          ) : (
            // For match slots: show move/replace buttons
            <>
              <Stack direction="row" spacing={1}>
                {isSourceCompletedOrInProgress ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleMoveClick}
                    disabled={isInsertDisabled}
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
                      disabled={isMoveDisabled}
                      fullWidth
                    >
                      {t('actions.move')}
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleReplaceClick}
                      disabled={isReplaceDisabled}
                      fullWidth
                    >
                      {t('actions.replace')}
                    </Button>
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

      {!secondSlot && (
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={handleClearClick}
          disabled={isClearDisabled}
        >
          {t('actions.clear')}
        </Button>
      )}
    </Stack>
  );
}

export const ActionButtons = memo(ActionButtonsComponent);

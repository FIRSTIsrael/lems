import { Stack, Button, Tooltip } from '@mui/material';
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
} from '../types';

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

interface ButtonState {
  disabled: boolean;
  reasonKey: string | null;
}

const getButtonState = (
  actionType: ActionType,
  selectedSlot: SlotInfo | null,
  secondSlot: SlotInfo | null,
  division: TournamentManagerData['division']
): ButtonState => {
  const sourceStatus = selectedSlot ? getSlotStatus(selectedSlot, division) : null;
  const isSourceLoaded = selectedSlot ? isSlotCurrentlyLoaded(selectedSlot, division) : false;
  const isDestinationLoaded = secondSlot ? isSlotCurrentlyLoaded(secondSlot, division) : false;
  const isDestinationBlocked = secondSlot
    ? isSlotBlockedAsDestination(secondSlot, division)
    : false;

  if (actionType === 'clear') {
    const disabled =
      !selectedSlot?.team ||
      isSlotCompleted(selectedSlot, division) ||
      isSlotInProgress(selectedSlot, division);
    return {
      disabled,
      reasonKey: disabled ? 'validation.no-team-selected' : null
    };
  }

  if (!secondSlot) {
    return { disabled: true, reasonKey: 'validation.select-destination' };
  }

  if (isSourceLoaded || isDestinationLoaded) {
    const reasonKey =
      actionType === 'move'
        ? isSourceLoaded
          ? 'validation.cannot-move-from-loaded'
          : 'validation.cannot-move-to-loaded'
        : actionType === 'replace'
          ? isSourceLoaded
            ? 'validation.cannot-replace-from-loaded'
            : 'validation.cannot-replace-to-loaded'
          : isSourceLoaded
            ? 'validation.cannot-insert-from-loaded'
            : 'validation.cannot-insert-to-loaded';
    return { disabled: true, reasonKey };
  }

  if (isDestinationBlocked) {
    return { disabled: true, reasonKey: 'validation.cannot-move-to-blocked' };
  }

  if (actionType === 'insert') {
    return { disabled: false, reasonKey: null };
  }

  if (sourceStatus !== 'not-started') {
    const reasonKey =
      actionType === 'move'
        ? 'validation.can-only-move-from-not-started'
        : 'validation.can-only-replace-from-not-started';
    return { disabled: true, reasonKey };
  }

  if (actionType === 'replace' && !secondSlot.team) {
    return { disabled: true, reasonKey: 'validation.cannot-replace-with-empty' };
  }

  return { disabled: false, reasonKey: null };
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

  const moveState = getButtonState('move', selectedSlot, secondSlot, division);
  const replaceState = getButtonState('replace', selectedSlot, secondSlot, division);
  const insertState = getButtonState('insert', selectedSlot, secondSlot, division);
  const clearState = getButtonState('clear', selectedSlot, secondSlot, division);

  const isSourceCompletedOrInProgress =
    selectedSlot &&
    (isSlotCompleted(selectedSlot, division) || isSlotInProgress(selectedSlot, division));

  const isJudgingSession = selectedSlot?.type === 'session';

  const moveTitle = moveState.reasonKey ? t(moveState.reasonKey) : t('move-tooltip');
  const replaceTitle = replaceState.reasonKey ? t(replaceState.reasonKey) : t('replace-tooltip');
  const insertTitle = insertState.reasonKey
    ? t(insertState.reasonKey)
    : t('insert-rematch-tooltip');

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
              <Tooltip title={replaceTitle} arrow>
                <span style={{ display: 'block' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleReplaceClick}
                    disabled={replaceState.disabled}
                    fullWidth
                  >
                    {t('replace')}
                  </Button>
                </span>
              </Tooltip>
              <Button variant="outlined" fullWidth onClick={handleCloseClick}>
                {t('cancel')}
              </Button>
            </>
          ) : (
            // For match slots: show move/replace buttons
            <>
              <Stack direction="row" spacing={1}>
                {isSourceCompletedOrInProgress ? (
                  <Tooltip title={insertTitle} arrow>
                    <span style={{ flex: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleMoveClick}
                        disabled={insertState.disabled}
                        fullWidth
                      >
                        {t('insert-rematch')}
                      </Button>
                    </span>
                  </Tooltip>
                ) : (
                  <>
                    <Tooltip title={moveTitle} arrow>
                      <span style={{ flex: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleMoveClick}
                          disabled={moveState.disabled}
                          fullWidth
                        >
                          {t('move')}
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip title={replaceTitle} arrow>
                      <span style={{ flex: 1 }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleReplaceClick}
                          disabled={replaceState.disabled}
                          fullWidth
                        >
                          {t('replace')}
                        </Button>
                      </span>
                    </Tooltip>
                  </>
                )}
              </Stack>
              <Button variant="outlined" fullWidth onClick={handleCloseClick}>
                {t('cancel')}
              </Button>
            </>
          )}
        </>
      )}

      <Tooltip
        title={
          clearState.reasonKey ? t(clearState.reasonKey) : t('validation.cannot-modify-in-progress')
        }
        arrow
      >
        <span style={{ display: 'block' }}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={handleClearClick}
            disabled={clearState.disabled}
          >
            {t('clear')}
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
}

export const ActionButtons = memo(ActionButtonsComponent);

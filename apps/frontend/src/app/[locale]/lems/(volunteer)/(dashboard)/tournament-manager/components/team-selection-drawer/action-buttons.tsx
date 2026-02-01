import { Stack, Button, Tooltip, Alert } from '@mui/material';
import { useTranslations } from 'next-intl';
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
  isSourceCompletedOrInProgress: boolean;
  error: string | null;
  onClearError: () => void;
  onMove: () => void;
  onReplace: () => void;
  onClear: () => void;
  onClose: () => void;
}

export function ActionButtons({
  selectedSlot,
  secondSlot,
  division,
  isSourceCompletedOrInProgress,
  error,
  onClearError,
  onMove,
  onReplace,
  onClear,
  onClose
}: ActionButtonsProps) {
  const t = useTranslations('pages.tournament-manager');

  const sourceStatus = selectedSlot ? getSlotStatus(selectedSlot, division) : null;
  const isSourceLoaded = selectedSlot ? isSlotCurrentlyLoaded(selectedSlot, division) : false;
  const isDestinationLoaded = secondSlot ? isSlotCurrentlyLoaded(secondSlot, division) : false;
  const isDestinationBlocked = secondSlot
    ? isSlotBlockedAsDestination(secondSlot, division)
    : false;

  // Move button disable state
  const isMoveDisabled =
    !secondSlot ||
    isDestinationBlocked ||
    sourceStatus !== 'not-started' ||
    isSourceLoaded ||
    isDestinationLoaded;
  const moveDisabledReasonKey = !secondSlot
    ? 'validation.select-destination'
    : isSourceLoaded
      ? 'validation.cannot-move-from-loaded'
      : isDestinationLoaded
        ? 'validation.cannot-move-to-loaded'
        : isDestinationBlocked
          ? 'validation.cannot-move-to-blocked'
          : sourceStatus !== 'not-started'
            ? 'validation.can-only-move-from-not-started'
            : null;

  // Replace button disable state
  const isReplaceDisabled =
    !secondSlot ||
    isDestinationBlocked ||
    sourceStatus !== 'not-started' ||
    !secondSlot?.team ||
    isSourceLoaded ||
    isDestinationLoaded;
  const replaceDisabledReasonKey = !secondSlot
    ? 'validation.select-destination'
    : isSourceLoaded
      ? 'validation.cannot-replace-from-loaded'
      : isDestinationLoaded
        ? 'validation.cannot-replace-to-loaded'
        : !secondSlot?.team
          ? 'validation.cannot-replace-with-empty'
          : isDestinationBlocked
            ? 'validation.cannot-move-to-blocked'
            : sourceStatus !== 'not-started'
              ? 'validation.can-only-replace-from-not-started'
              : null;

  // Insert button disable state
  const isInsertDisabled =
    !secondSlot || isDestinationBlocked || isSourceLoaded || isDestinationLoaded;
  const insertDisabledReasonKey = !secondSlot
    ? 'validation.select-destination'
    : isSourceLoaded
      ? 'validation.cannot-insert-from-loaded'
      : isDestinationLoaded
        ? 'validation.cannot-insert-to-loaded'
        : isDestinationBlocked
          ? 'validation.cannot-move-to-blocked'
          : null;

  // Clear button disable state
  const isClearDisabled =
    !selectedSlot?.team ||
    isSlotCompleted(selectedSlot, division) ||
    isSlotInProgress(selectedSlot, division);

  return (
    <Stack spacing={2}>
      {error && (
        <Alert severity="error" onClose={onClearError}>
          {error}
        </Alert>
      )}

      {secondSlot && (
        <>
          <Stack direction="row" spacing={1}>
            {isSourceCompletedOrInProgress ? (
              <Tooltip
                title={
                  insertDisabledReasonKey ? t(insertDisabledReasonKey) : t('insert-rematch-tooltip')
                }
                arrow
              >
                <span style={{ flex: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onMove}
                    disabled={isInsertDisabled}
                    fullWidth
                    sx={{ minWidth: 150, px: 3 }}
                  >
                    {t('insert-rematch')}
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <>
                <Tooltip
                  title={moveDisabledReasonKey ? t(moveDisabledReasonKey) : t('move-tooltip')}
                  arrow
                >
                  <span style={{ flex: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={onMove}
                      disabled={isMoveDisabled}
                      fullWidth
                      sx={{ minWidth: 150, px: 3 }}
                    >
                      {t('move')}
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    replaceDisabledReasonKey ? t(replaceDisabledReasonKey) : t('replace-tooltip')
                  }
                  arrow
                >
                  <span style={{ flex: 1 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={onReplace}
                      disabled={isReplaceDisabled}
                      fullWidth
                      sx={{ minWidth: 150, px: 3 }}
                    >
                      {t('replace')}
                    </Button>
                  </span>
                </Tooltip>
              </>
            )}
          </Stack>
          <Button variant="outlined" fullWidth onClick={onClose} sx={{ minWidth: 150, px: 3 }}>
            {t('cancel')}
          </Button>
        </>
      )}

      <Tooltip
        title={
          !selectedSlot?.team
            ? t('validation.no-team-selected')
            : isSlotCompleted(selectedSlot, division) || isSlotInProgress(selectedSlot, division)
              ? t('validation.cannot-modify-in-progress')
              : ''
        }
        arrow
      >
        <span style={{ display: 'block' }}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={onClear}
            disabled={isClearDisabled}
            sx={{ minWidth: 150, px: 3 }}
          >
            {t('clear')}
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
}

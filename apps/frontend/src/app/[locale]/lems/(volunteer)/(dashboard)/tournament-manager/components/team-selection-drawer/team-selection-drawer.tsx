'use client';

import { Drawer, Box, Alert, Divider, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { TournamentManagerData } from '../../graphql';
import { isSlotCompleted, isSlotInProgress } from '../types';
import { DRAWER_WIDTH_PX, MOBILE_DRAWER_HEIGHT_VH } from '../constants';
import type { SlotInfo } from '../types';
import {
  SelectedSlotHeader,
  FieldMatchesList,
  JudgingSessionsList,
  SecondSlotInfo,
  ActionButtons
} from './index';

interface TeamSelectionDrawerProps {
  open: boolean;
  selectedSlot: SlotInfo | null;
  secondSlot: SlotInfo | null;
  error: string | null;
  isMobile: boolean;
  division: TournamentManagerData['division'];
  onClose: () => void;
  onMove: () => void;
  onReplace: () => void;
  onClear: () => void;
  onClearError: () => void;
  getStage: (stage: string) => string;
}

export function TeamSelectionDrawerWrapper({
  open,
  selectedSlot,
  secondSlot,
  error,
  isMobile,
  division,
  onClose,
  onMove,
  onReplace,
  onClear,
  onClearError,
  getStage
}: TeamSelectionDrawerProps) {
  const t = useTranslations('pages.tournament-manager');

  const isSourceCompletedOrInProgress =
    selectedSlot &&
    (isSlotCompleted(selectedSlot, division) || isSlotInProgress(selectedSlot, division));

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{
        '& .MuiDrawer-paper': {
          width: isMobile ? '100%' : DRAWER_WIDTH_PX,
          height: isMobile ? `${MOBILE_DRAWER_HEIGHT_VH}vh` : 'auto',
          maxHeight: isMobile ? `${MOBILE_DRAWER_HEIGHT_VH}vh` : '100vh',
          boxSizing: 'border-box',
          p: 3,
          overflowY: 'auto'
        }
      }}
    >
      <SelectedSlotHeader selectedSlot={selectedSlot} onClose={onClose} />

      {selectedSlot && (
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={onClearError}>
              {error}
            </Alert>
          )}

          <Divider />

          <FieldMatchesList
            slot={selectedSlot}
            isMobile={isMobile}
            getStage={getStage}
            matches={division.field.matches}
          />

          <JudgingSessionsList
            slot={selectedSlot}
            isMobile={isMobile}
            sessions={division.judging.sessions}
          />

          {secondSlot && (
            <>
              <Divider />
              <SecondSlotInfo
                slot={secondSlot}
                division={division}
                isMobile={isMobile}
                getStage={getStage}
                matches={division.field.matches}
                sessions={division.judging.sessions}
              />

              <ActionButtons
                selectedSlot={selectedSlot}
                secondSlot={secondSlot}
                division={division}
                isSourceCompletedOrInProgress={isSourceCompletedOrInProgress}
                onMove={onMove}
                onReplace={onReplace}
                onClear={onClear}
                onClose={onClose}
              />
            </>
          )}

          {!secondSlot && (
            <Box>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {t('select-second-team-instruction')}
              </Typography>
            </Box>
          )}
        </Stack>
      )}
    </Drawer>
  );
}

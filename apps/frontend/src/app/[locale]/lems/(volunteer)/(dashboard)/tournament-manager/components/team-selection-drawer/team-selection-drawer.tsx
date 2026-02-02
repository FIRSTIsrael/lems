'use client';

import { Drawer, Box, Alert, Divider, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { TournamentManagerData } from '../../graphql';
import { DRAWER_WIDTH_PX, MOBILE_DRAWER_HEIGHT_VH } from '../constants';
import type { SlotInfo } from '../types';
import { SourceType } from '../types';
import { SelectedSlotHeader } from './selected-slot-header';
import { FieldMatchesList } from './field-matches-list';
import { JudgingSessionsList } from './judging-sessions-list';
import { SecondSlotInfo } from './second-slot-info';
import { ActionButtons } from './action-buttons';

interface TeamSelectionDrawerProps {
  open: boolean;
  selectedSlot: SlotInfo | null;
  sourceType: SourceType | null;
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
  sourceType,
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
            division={division}
            slot={selectedSlot}
            isMobile={isMobile}
            getStage={getStage}
            matches={division.field.matches}
          />

          <JudgingSessionsList
            division={division}
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
            </>
          )}

          <ActionButtons
            selectedSlot={selectedSlot}
            sourceType={sourceType}
            secondSlot={secondSlot}
            onMove={onMove}
            onReplace={onReplace}
            onClear={onClear}
            onClose={onClose}
          />

          {!secondSlot && (
            <Box>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {t('slots.select-second-team-instruction')}
              </Typography>
            </Box>
          )}
        </Stack>
      )}
    </Drawer>
  );
}

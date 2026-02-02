'use client';

import { Drawer, Box, Alert, Divider, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useTournamentManager } from '../../context';
import { DRAWER_WIDTH_PX, MOBILE_DRAWER_HEIGHT_VH } from '../constants';
import { SelectedSlotHeader } from './selected-slot-header';
import { FieldMatchesList } from './field-matches-list';
import { JudgingSessionsList } from './judging-sessions-list';
import { SecondSlotInfo } from './second-slot-info';
import { ActionButtons } from './action-buttons';

interface TeamSelectionDrawerProps {
  open: boolean;
  isMobile: boolean;
  onClose: () => void;
  onMove: () => Promise<void>;
  onReplace: () => Promise<void>;
  onClear: () => Promise<void>;
  onClearError: () => void;
}

export function TeamSelectionDrawer({
  open,
  isMobile,
  onClose,
  onMove,
  onReplace,
  onClear,
  onClearError
}: TeamSelectionDrawerProps) {
  const t = useTranslations('pages.tournament-manager');
  const { division, selectedSlot, secondSlot, error } = useTournamentManager();

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
                matches={division.field.matches}
                sessions={division.judging.sessions}
              />
            </>
          )}

          <ActionButtons
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

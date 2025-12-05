'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Paper,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  InfoRounded,
  PlayArrowRounded,
  StopRounded,
  KeyboardArrowDownRounded,
  VideogameAssetRounded
} from '@mui/icons-material';
import { useScorekeeperData } from '../scorekeeper-context';

interface ControlButtonsProps {
  hasActiveMatch?: boolean;
  hasLoadedMatch?: boolean;
  hasNextUnplayedMatch?: boolean;
  allParticipantsReady?: boolean;
  onStartTestMatch: () => Promise<void>;
  onLoadNextMatch: () => Promise<void>;
  onStartMatch: () => Promise<void>;
  onAbortMatch: () => Promise<void>;
  isLoading?: boolean;
}

export function ControlButtons({
  hasActiveMatch: propHasActiveMatch,
  hasLoadedMatch: propHasLoadedMatch,
  hasNextUnplayedMatch: propHasNextUnplayedMatch,
  allParticipantsReady: propAllParticipantsReady,
  onStartTestMatch,
  onLoadNextMatch,
  onStartMatch,
  onAbortMatch,
  isLoading = false
}: ControlButtonsProps) {
  const t = useTranslations('pages.scorekeeper.controls');
  const theme = useTheme();
  const [abortDialogOpen, setAbortDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use context values if props are not provided
  const contextData = useScorekeeperData();
  const hasActiveMatch = propHasActiveMatch ?? contextData.hasActiveMatch;
  const hasLoadedMatch = propHasLoadedMatch ?? contextData.hasLoadedMatch;
  const hasNextUnplayedMatch = propHasNextUnplayedMatch ?? contextData.hasNextUnplayedMatch;
  const allParticipantsReady = propAllParticipantsReady ?? contextData.allParticipantsReady;

  const handleAbortClick = () => {
    setAbortDialogOpen(true);
  };

  const handleAbortConfirm = async () => {
    setAbortDialogOpen(false);
    setIsSubmitting(true);
    try {
      await onAbortMatch();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartTestMatch = async () => {
    setIsSubmitting(true);
    try {
      await onStartTestMatch();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadNextMatch = async () => {
    setIsSubmitting(true);
    try {
      await onLoadNextMatch();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartMatch = async () => {
    setIsSubmitting(true);
    try {
      await onStartMatch();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color={hasActiveMatch ? 'error' : 'success'}
              size="large"
              fullWidth
              disabled={(!hasLoadedMatch && !hasActiveMatch) || isLoading || isSubmitting}
              onClick={hasActiveMatch ? handleAbortClick : handleStartMatch}
              startIcon={hasActiveMatch ? <StopRounded /> : <PlayArrowRounded />}
              sx={{ py: 1.25, fontSize: '1rem', fontWeight: 600 }}
            >
              {hasActiveMatch ? t('abort-match') : t('start-match')}
            </Button>

            <Tooltip title={t('load-next')}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                disabled={
                  !hasNextUnplayedMatch ||
                  hasLoadedMatch ||
                  hasActiveMatch ||
                  isLoading ||
                  isSubmitting
                }
                onClick={handleLoadNextMatch}
                startIcon={<KeyboardArrowDownRounded sx={{ fontSize: '1.1rem' }} />}
                sx={{ py: 0.75, fontSize: '0.875rem', fontWeight: 500 }}
              >
                {t('load-next')}
              </Button>
            </Tooltip>
            <Tooltip title={t('test-match')}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                disabled={hasActiveMatch || isLoading || isSubmitting}
                onClick={handleStartTestMatch}
                startIcon={<VideogameAssetRounded sx={{ fontSize: '1.1rem' }} />}
                sx={{ py: 0.75, fontSize: '0.875rem', fontWeight: 500 }}
              >
                {t('test-match')}
              </Button>
            </Tooltip>
          </Stack>

          {/* Status Indicators */}
          {!allParticipantsReady && hasLoadedMatch && !hasActiveMatch && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                bgcolor: 'warning.lighter',
                borderRadius: 0.75,
                border: `1px solid ${theme.palette.warning.light}`
              }}
            >
              <InfoRounded sx={{ fontSize: '1.1rem', color: 'warning.main', flexShrink: 0 }} />
              <Box sx={{ fontSize: '0.75rem', color: 'warning.dark', fontWeight: 500 }}>
                {t('not-all-ready')}
              </Box>
            </Box>
          )}
        </Stack>
      </Paper>

      <Dialog
        open={abortDialogOpen}
        onClose={() => setAbortDialogOpen(false)}
        aria-labelledby="abort-dialog-title"
      >
        <DialogTitle id="abort-dialog-title" sx={{ fontWeight: 600 }}>
          {t('abort-confirm-title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary', mt: 1 }}>
            {t('abort-confirm-message')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setAbortDialogOpen(false)}
            variant="outlined"
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleAbortConfirm}
            variant="contained"
            color="error"
            disabled={isSubmitting}
          >
            {t('confirm-abort')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

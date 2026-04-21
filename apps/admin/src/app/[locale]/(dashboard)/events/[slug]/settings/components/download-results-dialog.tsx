'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  LinearProgress,
  Stack,
  Box
} from '@mui/material';

interface DownloadResultsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (onProgress: (percent: number) => void) => Promise<void>;
  eventName: string;
}

export const DownloadResultsDialog: React.FC<DownloadResultsDialogProps> = ({
  open,
  onClose,
  onConfirm,
  eventName
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const t = useTranslations('pages.events.settings.dialogs.download-results');

  const handleConfirm = async () => {
    setIsDownloading(true);
    setProgress(0);
    try {
      await onConfirm(setProgress);
    } finally {
      setIsDownloading(false);
      setProgress(null);
    }
  };

  return (
    <Dialog open={open} onClose={isDownloading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography>{t('message')}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {t('event-name', { eventName })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('info')}
          </Typography>
          {progress !== null && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t('generating')}
              </Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ mt: 0.5 }} />
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDownloading}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="secondary"
          disabled={isDownloading}
          startIcon={isDownloading ? <CircularProgress size={16} /> : undefined}
        >
          {isDownloading ? t('downloading') : t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

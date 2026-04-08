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
  Stack
} from '@mui/material';

interface DownloadResultsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  eventName: string;
}

export const DownloadResultsDialog: React.FC<DownloadResultsDialogProps> = ({
  open,
  onClose,
  onConfirm,
  eventName
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const t = useTranslations('pages.events.settings.dialogs.download-results');

  const handleConfirm = async () => {
    setIsDownloading(true);
    try {
      await onConfirm();
    } finally {
      setIsDownloading(false);
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

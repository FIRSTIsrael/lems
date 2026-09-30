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
  Alert
} from '@mui/material';

interface CompleteEventDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<{ success: boolean; errorMessage?: string }>;
  eventName: string;
}

export const CompleteEventDialog: React.FC<CompleteEventDialogProps> = ({
  open,
  onClose,
  onConfirm,
  eventName
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('pages.events.settings.dialogs.complete-event');

  const handleConfirm = async () => {
    setIsCompleting(true);
    setError(null);
    try {
      const result = await onConfirm();
      if (!result.success && result.errorMessage) {
        setError(result.errorMessage);
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={isCompleting ? undefined : handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <Typography>{t('message')}</Typography>
        <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
          {t('event-name', { eventName })}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isCompleting}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={isCompleting}
          startIcon={isCompleting ? <CircularProgress size={16} /> : undefined}
        >
          {isCompleting ? t('completing') : t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

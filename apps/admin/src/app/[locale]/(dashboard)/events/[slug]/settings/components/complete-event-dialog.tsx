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
  CircularProgress
} from '@mui/material';

interface CompleteEventDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  eventName: string;
}

export const CompleteEventDialog: React.FC<CompleteEventDialogProps> = ({
  open,
  onClose,
  onConfirm,
  eventName
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const t = useTranslations('pages.events.settings.dialogs.complete-event');

  const handleConfirm = async () => {
    setIsCompleting(true);
    try {
      await onConfirm();
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={isCompleting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <Typography>
          {t('message')}
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
          {t('event-name', { eventName })}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isCompleting}>
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
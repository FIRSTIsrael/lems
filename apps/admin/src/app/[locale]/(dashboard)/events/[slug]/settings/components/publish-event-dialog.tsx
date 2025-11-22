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

interface PublishEventDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  eventName: string;
}

export const PublishEventDialog: React.FC<PublishEventDialogProps> = ({
  open,
  onClose,
  onConfirm,
  eventName
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const t = useTranslations('pages.events.settings.dialogs.publish-event');

  const handleConfirm = async () => {
    setIsPublishing(true);
    try {
      await onConfirm();
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={open} onClose={isPublishing ? undefined : onClose} maxWidth="sm" fullWidth>
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
        <Button onClick={onClose} disabled={isPublishing}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="secondary"
          disabled={isPublishing}
          startIcon={isPublishing ? <CircularProgress size={16} /> : undefined}
        >
          {isPublishing ? t('publishing') : t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
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
  Box,
  Alert
} from '@mui/material';

interface PublishEventDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (onProgress: (percent: number, message?: string) => void) => Promise<void>;
  eventName: string;
}

export const PublishEventDialog: React.FC<PublishEventDialogProps> = ({
  open,
  onClose,
  onConfirm,
  eventName
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const t = useTranslations('pages.events.settings.dialogs.publish-event');

  const handleConfirm = async () => {
    setIsPublishing(true);
    setProgress(0);
    setProgressMessage(null);
    try {
      await onConfirm((percent, message) => {
        setProgress(percent);
        if (message) setProgressMessage(message);
      });
    } finally {
      setIsPublishing(false);
      setProgress(null);
      setProgressMessage(null);
    }
  };

  return (
    <Dialog open={open} onClose={isPublishing ? undefined : onClose} maxWidth="sm" fullWidth>
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
              {progressMessage ? (
                <Alert severity="info" sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                    {progressMessage}
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} />
                </Alert>
              ) : (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('publishing-progress')}
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} sx={{ mt: 0.5 }} />
                </Box>
              )}
            </Box>
          )}
        </Stack>
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
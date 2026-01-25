'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Division } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';

interface DeletePitMapDialogProps {
  division: Division;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export const DeletePitMapDialog: React.FC<DeletePitMapDialogProps> = ({
  division,
  open,
  onClose,
  onSuccess,
  onError
}) => {
  const [deleting, setDeleting] = useState(false);
  const t = useTranslations('pages.events.venue.pit-map.delete-dialog');

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const result = await apiFetch(
        `/admin/events/${division.eventId}/divisions/${division.id}/pit-map`,
        {
          method: 'DELETE'
        }
      );

      if (result.ok) {
        onSuccess?.();
        onClose();
      } else {
        onError?.(t('delete-error'));
      }
    } catch {
      onError?.(t('delete-error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={deleting ? undefined : onClose}>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <Typography>{t('confirmation')}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleting}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={deleting}
          startIcon={deleting ? <CircularProgress size={16} /> : undefined}
        >
          {deleting ? t('deleting') : t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Alert
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@lems/shared';
import { Division } from '@lems/types/api/admin';

interface DeleteDivisionDialogProps {
  open: boolean;
  onClose: () => void;
  division: Division | null;
  onDelete: () => Promise<void>;
}

export const DeleteDivisionDialog: React.FC<DeleteDivisionDialogProps> = ({
  open,
  onClose,
  division,
  onDelete
}) => {
  const t = useTranslations('pages.events.divisions.list');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!division) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await apiFetch(`/admin/events/${division.eventId}/divisions/${division.id}`, {
        method: 'DELETE'
      });

      if (result.ok) {
        await onDelete();
        onClose();
      } else {
        setError('Failed to delete division');
      }
    } catch (err) {
      console.error('Error deleting division:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('delete.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {t('delete.message', { name: division?.name || '' })}
        </DialogContentText>
        <DialogContentText sx={{ fontWeight: 'bold' }}>{t('delete.warning')}</DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isDeleting}>
          {t('delete.cancel')}
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
          {isDeleting ? t('delete.deleting') : t('delete.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

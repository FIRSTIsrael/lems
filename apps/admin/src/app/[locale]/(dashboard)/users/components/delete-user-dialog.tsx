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

interface DeleteUserDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onDelete: (userId: string) => Promise<void>;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onClose,
  userId,
  userName,
  onDelete
}) => {
  const t = useTranslations('pages.users.delete');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await onDelete(userId);
      onClose();
    } catch (err) {
      console.error('Error deleting user:', err);
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
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{t('message', { userName })}</DialogContentText>
        <DialogContentText sx={{ fontWeight: 'bold' }}>{t('warning')}</DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isDeleting}>
          {t('cancel')}
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
          {isDeleting ? t('deleting') : t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

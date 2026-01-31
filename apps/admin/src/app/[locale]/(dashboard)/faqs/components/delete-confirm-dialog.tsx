'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { mutate } from 'swr';
import { FaqResponse } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';

interface DeleteConfirmDialogProps {
  open: boolean;
  faq: FaqResponse;
  onClose: () => void;
}

export function DeleteConfirmDialog({ open, faq, onClose }: DeleteConfirmDialogProps) {
  const t = useTranslations('pages.faqs.delete');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await apiFetch(`/admin/faqs/${faq.id}`, {
        method: 'DELETE'
      });

      if (!result.ok) {
        throw new Error('Failed to delete FAQ');
      }

      // Refresh FAQ lists
      await Promise.all([
        mutate('/admin/faqs'),
        mutate(key => typeof key === 'string' && key.startsWith('/admin/faqs/season/'))
      ]);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography>{t('message')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>{t('question')}:</strong> {faq.question}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          {t('actions.cancel')}
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={20} /> : undefined}
        >
          {isDeleting ? t('actions.deleting') : t('actions.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

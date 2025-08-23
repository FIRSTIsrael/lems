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
import { apiFetch } from '../../../../../../../lib/fetch';

interface UploadPitMapDialogProps {
  division: Division;
  selectedFile: File | null;
  open: boolean;
  onClose: () => void;
  onUpload?: () => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export const UploadPitMapDialog: React.FC<UploadPitMapDialogProps> = ({
  division,
  selectedFile,
  open,
  onUpload,
  onClose,
  onSuccess,
  onError
}) => {
  const [uploading, setUploading] = useState(false);
  const t = useTranslations('pages.events.venue.pit-map.upload-dialog');

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      onUpload?.();

      const formData = new FormData();
      formData.append('pitMap', selectedFile);

      const result = await apiFetch(
        `/admin/events/${division.eventId}/divisions/${division.id}/pit-map`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (result.ok) {
        onSuccess?.();
      } else {
        onError?.(t('upload-error'));
      }
    } catch {
      onError?.(t('upload-error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('upload-button')}</DialogTitle>
      <DialogContent>
        <Typography>{t('upload-confirmation')}</Typography>
        {selectedFile && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>{t('file-label')}:</strong> {selectedFile.name}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={16} /> : undefined}
        >
          {uploading ? t('uploading') : t('upload')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

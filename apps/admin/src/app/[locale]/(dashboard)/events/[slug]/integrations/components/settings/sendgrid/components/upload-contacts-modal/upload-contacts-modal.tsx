'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Button,
  Alert
} from '@mui/material';
import { useSendGridContacts } from '../../context';
import { UploadForm, type UploadSummary } from './upload-form';
import { PreviewView } from './preview-view';

interface UploadContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadContactsModal: React.FC<UploadContactsModalProps> = ({ isOpen, onClose }) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');
  const { syncContacts } = useSendGridContacts();

  const [uploadResult, setUploadResult] = useState<UploadSummary | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const handleUploadSuccess = (result: UploadSummary) => {
    setUploadResult(result);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
  };

  const handleConfirm = async () => {
    if (!uploadResult) return;

    const allContacts = [...uploadResult.added, ...uploadResult.updated];
    syncContacts(allContacts);
    onClose();
  };

  const handleCancel = () => {
    setUploadResult(null);
    setUploadError('');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('upload-contacts-modal-title')}</DialogTitle>
      <DialogContent sx={{ minWidth: 600 }}>
        {uploadResult ? (
          <PreviewView result={uploadResult} onConfirm={handleConfirm} onCancel={handleCancel} />
        ) : (
          <Stack spacing={2}>
            {uploadError && <Alert severity="error">{uploadError}</Alert>}
            <UploadForm onSuccess={handleUploadSuccess} onError={handleUploadError} />
          </Stack>
        )}
      </DialogContent>
      {!uploadResult && (
        <DialogActions>
          <Button onClick={onClose}>{t('cancel')}</Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

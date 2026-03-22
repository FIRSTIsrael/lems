'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, CircularProgress, Stack } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { FileUpload, apiFetch } from '@lems/shared';
import { useEvent } from '../../../../../../components/event-context';
import { Contact, ContactError } from '../../types';
import { UploadInstructions } from './upload-instructions';

export interface UploadSummary {
  added: Contact[];
  updated: Contact[];
  errors: ContactError[];
  total: number;
}

interface UploadFormProps {
  onSuccess: (result: UploadSummary) => void;
  onError: (error: string) => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ onSuccess, onError }) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const event = useEvent();

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    try {
      const csvContent = await selectedFile.text();

      const response = await apiFetch(`/integrations/sendgrid/${event.id}/upload-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent })
      });

      if (!response.ok) {
        const error = response.error as string;
        onError(error || t('csv-error-upload-failed'));
        return;
      }

      const summary = response.data as UploadSummary;
      onSuccess(summary);
    } catch (error) {
      onError(error instanceof Error ? error.message : t('csv-error-upload-failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <UploadInstructions />

      <FileUpload
        label={t('fields.file.label')}
        accept=".csv,text/csv"
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        description={t('fields.file.description')}
        disabled={isSubmitting}
        placeholder={t('fields.file.placeholder')}
      />

      <Stack direction="row" justifyContent="center">
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          disabled={!selectedFile || isSubmitting}
          sx={{ minWidth: 200 }}
        >
          {isSubmitting ? t('uploading') : t('upload')}
        </Button>
      </Stack>
    </Stack>
  );
};

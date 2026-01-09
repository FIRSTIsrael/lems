'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Typography, Box, Button, Stack, Alert } from '@mui/material';
import { Upload, Visibility } from '@mui/icons-material';
import { Division } from '@lems/types/api/admin';
import { FileUpload } from '@lems/shared';
import { UploadPitMapDialog } from './upload-pit-map-dialog';
import { ViewPitMapDialog } from './view-pit-map-dialog';

interface PitMapManagerProps {
  division: Division;
  onDivisionUpdate?: () => void;
}

export const PitMapManager: React.FC<PitMapManagerProps> = ({ division, onDivisionUpdate }) => {
  const t = useTranslations('pages.events.venue.pit-map');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewMapOpen, setViewMapOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select an image file');
        setSuccessMessage('');
        return;
      }
      const maxSize = 10 * 1024 * 1024; // 10 MB
      if (file.size > maxSize) {
        setErrorMessage('File size must not exceed 10 MB');
        setSuccessMessage('');
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setUploading(true);
  };

  const handleUploadSuccess = () => {
    setSuccessMessage(t('upload-success'));
    setUploadDialogOpen(false);
    setSelectedFile(null);
    onDivisionUpdate?.();
    setUploading(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUploadError = (message: string) => {
    setErrorMessage(message);
    setUploading(false);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('title')}
      </Typography>

      <Stack spacing={2}>
        <Box maxWidth={300}>
          <FileUpload
            label={t('upload-button')}
            placeholder={t('upload-placeholder')}
            accept="image/jpeg,image/jpg,image/png"
            selectedFile={selectedFile}
            setSelectedFile={handleFileChange}
            description="JPG, JPEG, or PNG format, recommended 16:9 aspect ratio"
            disabled={uploading}
          />
        </Box>

        {(selectedFile || division.pitMapUrl) && (
          <Stack direction="row" spacing={2} alignItems="center">
            {selectedFile && (
              <Button
                variant="contained"
                startIcon={<Upload />}
                onClick={() => setUploadDialogOpen(true)}
                disabled={uploading}
              >
                {t('upload-button')}
              </Button>
            )}

            {division.pitMapUrl && (
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => setViewMapOpen(true)}
              >
                {t('view-button')}
              </Button>
            )}
          </Stack>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {successMessage}
          </Alert>
        )}

        {!division.pitMapUrl && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('no-map')}
            </Typography>
          </Box>
        )}
      </Stack>

      <UploadPitMapDialog
        open={uploadDialogOpen}
        onClose={() => !uploading && setUploadDialogOpen(false)}
        division={division}
        selectedFile={selectedFile}
        onUpload={handleUpload}
        onSuccess={handleUploadSuccess}
        onError={handleUploadError}
      />

      <ViewPitMapDialog
        open={viewMapOpen}
        onClose={() => setViewMapOpen(false)}
        division={division}
      />
    </Paper>
  );
};

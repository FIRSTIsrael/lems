'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { mutate } from 'swr';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { FileUpload, apiFetch } from '@lems/shared';
import { Team } from '@lems/types/api/admin';

interface LogoUploadDialogProps {
  team: Team;
  open: boolean;
  onClose: () => void;
}

export const LogoUploadDialog: React.FC<LogoUploadDialogProps> = ({ team, open, onClose }) => {
  const t = useTranslations('pages.teams.logo-upload-dialog');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setError(null);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', team.name);
      formData.append('affiliation', team.affiliation);
      formData.append('city', team.city);
      formData.append('logo', selectedFile);

      const response = await apiFetch(
        `/admin/teams/${team.id}`,
        {
          method: 'PUT',
          body: formData
        }
      );

      if (response.ok) {
        await mutate('/admin/teams?extraFields=deletable');
        setSelectedFile(null);
        handleClose();
      } else {
        setError(t('errors.upload-failed'));
      }
    } catch (err) {
      setError(t('errors.upload-failed'));
      console.error('Error uploading logo:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title', { number: team.number })}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <FileUpload
              label={t('fields.logo.label')}
              accept=".jpg,.jpeg,.png,.svg,image/*"
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              description={t('fields.logo.description')}
              disabled={isUploading}
              placeholder={t('fields.logo.placeholder')}
            />

            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isUploading}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedFile || isUploading}
          startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUpload />}
        >
          {isUploading ? t('uploading') : t('upload')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

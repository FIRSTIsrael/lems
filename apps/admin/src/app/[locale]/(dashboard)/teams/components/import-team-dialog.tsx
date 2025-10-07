'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { mutate } from 'swr';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { FileUpload, apiFetch } from '@lems/shared';
import { AdminTeamsImportResponseSchema } from '@lems/types/api/admin';
import { DialogComponentProps } from '../../components/dialog-provider';

interface ImportResult {
  created: Array<{ name: string; number: number }>;
  updated: Array<{ name: string; number: number }>;
}

const ImportForm: React.FC<{ onSuccess: (result: ImportResult) => void }> = ({ onSuccess }) => {
  const t = useTranslations('pages.teams.import-dialog.form');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const result = await apiFetch(
        '/admin/teams/import',
        {
          method: 'POST',
          body: formData
        },
        AdminTeamsImportResponseSchema
      );

      if (result.ok) {
        mutate('/admin/teams');
        onSuccess(result.data as ImportResult);
      } else {
        if (result.status === 400) {
          setError('invalid-file');
        } else {
          setError('upload-error');
        }
      }
    } catch {
      setError('upload-error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" mb={1}>
          <Box pt={0.33}>
            <InfoIcon color="primary" />
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('instructions.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('instructions.description')}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          {t('instructions.csv-format')}
        </Typography>
        <List dense>
          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('instructions.requirements.header')}
              slotProps={{ primary: { variant: 'body2' } }}
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('instructions.requirements.columns')}
              slotProps={{ primary: { variant: 'body2' } }}
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('instructions.requirements.encoding')}
              slotProps={{ primary: { variant: 'body2' } }}
            />
          </ListItem>
        </List>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          {t('instructions.example')}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
          <Typography variant="body2" component="pre" dir="ltr" sx={{ whiteSpace: 'pre-wrap' }}>
            {`1234,Iron Patriots,Lincoln Elementary,New York
5678,Tech Titans,Washington High School,Seattle
9999,Code Crushers,Innovation Academy,Austin`}
          </Typography>
        </Paper>
      </Paper>

      <FileUpload
        label={t('fields.file.label')}
        accept=".csv,text/csv"
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        description={t('fields.file.description')}
        disabled={isSubmitting}
        placeholder={t('fields.file.placeholder')}
      />

      {error && <Alert severity="error">{t(`errors.${error}`)}</Alert>}

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

const SuccessView: React.FC<{ result: ImportResult; onClose: () => void }> = ({
  result,
  onClose
}) => {
  const t = useTranslations('pages.teams.import-dialog.success');

  return (
    <Stack spacing={3} alignItems="center">
      <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />

      <Typography variant="h6" textAlign="center">
        {t('title')}
      </Typography>

      {result.created.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t('created', { count: result.created.length })}
          </Typography>
          <List dense>
            {result.created.slice(0, 5).map(team => (
              <ListItem key={team.number} disablePadding>
                <ListItemText
                  primary={`#${team.number} - ${team.name}`}
                  slotProps={{ primary: { variant: 'body2' } }}
                />
              </ListItem>
            ))}
            {result.created.length > 5 && (
              <ListItem disablePadding>
                <ListItemText
                  primary={t('and-more', { count: result.created.length - 5 })}
                  slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      )}

      {result.updated.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t('updated', { count: result.updated.length })}
          </Typography>
          <List dense>
            {result.updated.slice(0, 5).map(team => (
              <ListItem key={team.number} disablePadding>
                <ListItemText
                  primary={`#${team.number} - ${team.name}`}
                  slotProps={{ primary: { variant: 'body2' } }}
                />
              </ListItem>
            ))}
            {result.updated.length > 5 && (
              <ListItem disablePadding>
                <ListItemText
                  primary={t('and-more', { count: result.updated.length - 5 })}
                  slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      )}

      <Button variant="contained" onClick={onClose} sx={{ minWidth: 200 }}>
        {t('close')}
      </Button>
    </Stack>
  );
};

export const ImportTeamDialog: React.FC<DialogComponentProps> = ({ close }) => {
  const t = useTranslations('pages.teams.import-dialog');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleSuccess = (result: ImportResult) => {
    setImportResult(result);
  };

  return (
    <>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent sx={{ minWidth: 600 }}>
        {importResult ? (
          <SuccessView result={importResult} onClose={close} />
        ) : (
          <ImportForm onSuccess={handleSuccess} />
        )}
      </DialogContent>
      {!importResult && (
        <DialogActions>
          <Button onClick={close}>{t('actions.cancel')}</Button>
        </DialogActions>
      )}
    </>
  );
};

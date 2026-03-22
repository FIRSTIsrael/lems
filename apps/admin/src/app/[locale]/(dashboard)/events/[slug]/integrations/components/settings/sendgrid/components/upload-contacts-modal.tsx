'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
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
  Description as DescriptionIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { FileUpload, Flag, apiFetch } from '@lems/shared';
import { useEvent } from '../../../../../components/event-context';
import { useSendGridContacts } from '../context';
import { Contact, ContactError } from '../types';

interface UploadContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadSummary {
  added: Contact[];
  updated: Contact[];
  errors: ContactError[];
  total: number;
}

const UploadForm: React.FC<{
  onSuccess: (result: UploadSummary) => void;
  onError: (error: string) => void;
}> = ({ onSuccess, onError }) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const event = useEvent();

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    try {
      const csvContent = await selectedFile.text();

      // Send raw CSV to backend for validation, parsing, and merging
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

      // Backend returns summary with added, updated, errors, and total
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
      <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" mb={1}>
          <Box pt={0.33}>
            <InfoIcon color="primary" />
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('email-contacts-title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('csv-description')}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          {t('csv-requirements-title')}
        </Typography>
        <List dense>
          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('csv-requirement-header')}
              slotProps={{ primary: { variant: 'body2' } }}
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('csv-requirement-columns')}
              slotProps={{ primary: { variant: 'body2' } }}
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('csv-requirement-encoding')}
              slotProps={{ primary: { variant: 'body2' } }}
            />
          </ListItem>
        </List>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          {t('csv-example')}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
          <Typography variant="body2" component="pre" dir="ltr" sx={{ whiteSpace: 'pre-wrap' }}>
            {`Team Number,Region,Recipient Email
1234,US,john@example.com
5678,US,jane@example.com
9999,US,bob@example.com`}
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

const PreviewView: React.FC<{
  result: UploadSummary;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ result, onConfirm, onCancel }) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');

  return (
    <Stack spacing={3} alignItems="center">
      <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />

      <Typography variant="h6" textAlign="center">
        {t('csv-success-title')}
      </Typography>

      {result.added.length > 0 && (
        <Box width="100%">
          <Typography variant="subtitle2" gutterBottom>
            {t('csv-success-added', { count: result.added.length })}
          </Typography>
          <List dense>
            {result.added.slice(0, 3).map(contact => (
              <ListItem key={contact.team_number} disablePadding>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1}>
                      <Flag region={contact.region} size={20} />
                      <Typography>{`#${contact.team_number} - ${contact.recipient_email}`}</Typography>
                    </Stack>
                  }
                  slotProps={{ primary: { variant: 'body2' } }}
                />
              </ListItem>
            ))}
            {result.added.length > 3 && (
              <ListItem disablePadding>
                <ListItemText
                  primary={t('csv-success-and-more', { count: result.added.length - 3 })}
                  slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      )}

      {result.updated.length > 0 && (
        <Box width="100%">
          <Typography variant="subtitle2" gutterBottom>
            {t('csv-success-updated', { count: result.updated.length })}
          </Typography>
          <List dense>
            {result.updated.slice(0, 3).map(contact => (
              <ListItem key={contact.team_number} disablePadding>
                <ListItemText
                  primary={`#${contact.team_number} - ${contact.recipient_email}`}
                  secondary={contact.region}
                  slotProps={{ primary: { variant: 'body2' } }}
                />
              </ListItem>
            ))}
            {result.updated.length > 3 && (
              <ListItem disablePadding>
                <ListItemText
                  primary={t('csv-success-and-more', { count: result.updated.length - 3 })}
                  slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      )}

      {result.errors.length > 0 && (
        <Alert severity="warning" sx={{ width: '100%' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            {t('csv-validation-errors', { count: result.errors.length })}
          </Typography>
          <List dense sx={{ mt: 1 }}>
            {result.errors.slice(0, 5).map((error, idx) => (
              <ListItem key={idx} disablePadding>
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <ErrorIcon fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary={`Row ${error.rowIndex}: ${error.message}`}
                  slotProps={{ primary: { variant: 'body2' } }}
                />
              </ListItem>
            ))}
            {result.errors.length > 5 && (
              <ListItem disablePadding>
                <ListItemText
                  primary={t('csv-error-and-more', { count: result.errors.length - 5 })}
                  slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }}
                />
              </ListItem>
            )}
          </List>
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'center', mt: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          {t('csv-preview-cancel')}
        </Button>
        <Button onClick={onConfirm} variant="contained">
          {t('csv-preview-confirm')}
        </Button>
      </Stack>
    </Stack>
  );
};

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

    // Backend has already merged and persisted the contacts
    // Sync the full list (added + updated) into context
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

'use client';

import { useRef } from 'react';
import {
  Stack,
  Button,
  Alert,
  CircularProgress,
  Box,
  Divider,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Info as InfoIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { IntegrationSettingsComponentProps } from '../settings-factory';
import { SendGridProvider, useSendGrid } from './sendgrid-context';
import { SendGridForm } from './form';
import { UploadModal } from './upload-modal';
import { UploadedContacts } from './uploaded-contacts';

const SendGridSettingsContent: React.FC<{
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}> = ({ fileInputRef }) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');
  const {
    formValues,
    errors,
    csvError,
    csvSuccess,
    isTestingEmail,
    uploadedContacts,
    showUploadModal,
    uploadModalData,
    handleFieldChange,
    handleCSVUpload,
    handleTestEmail,
    handleReplaceContacts,
    handleCloseUploadModal
  } = useSendGrid();

  const onReplace = () => {
    handleReplaceContacts();
    fileInputRef.current?.click();
  };

  return (
    <Stack spacing={3} sx={{ py: 2 }}>
      <SendGridForm formValues={formValues} onFieldChange={handleFieldChange} errors={errors} />

      <Button
        variant="outlined"
        disabled={isTestingEmail || !formValues.fromAddress || !formValues.templateId}
        onClick={handleTestEmail}
      >
        {isTestingEmail ? <CircularProgress size={24} /> : t('send-test-email-button')}
      </Button>

      <Divider />

      {uploadedContacts.length > 0 ? (
        <UploadedContacts contacts={uploadedContacts} onReplace={onReplace} />
      ) : (
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

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon sx={{ fontSize: 20 }} />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
            >
              {t('upload-csv-button')}
            </Button>
          </Box>
        </Paper>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleCSVUpload(file);
        }}
      />

      {csvError && <Alert severity="error">{csvError}</Alert>}
      {csvSuccess && <Alert severity="success">{csvSuccess}</Alert>}

      <UploadModal
        open={showUploadModal}
        onClose={handleCloseUploadModal}
        onUploadAnother={onReplace}
        successCount={uploadModalData.successCount}
        errorCount={uploadModalData.errorCount}
        sampleContacts={uploadModalData.sampleContacts}
      />
    </Stack>
  );
};

export const SendGridSettings: React.FC<IntegrationSettingsComponentProps> = ({
  settings,
  onSave,
  showErrors = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <SendGridProvider settings={settings} onSave={onSave} showErrors={showErrors}>
      <SendGridSettingsContent fileInputRef={fileInputRef} />
    </SendGridProvider>
  );
};

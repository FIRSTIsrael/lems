'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Info as InfoIcon, Description as DescriptionIcon } from '@mui/icons-material';
import {
  Stack,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { SendGridSettingsSchema } from '@lems/shared/integrations';
import { IntegrationSettingsComponentProps } from './settings-factory';

interface SendGridFormValues {
  templateId: string;
  fromAddress: string;
  testEmailAddress: string;
}

export const SendGridSettings: React.FC<IntegrationSettingsComponentProps> = ({
  settings,
  onSave,
  isLoading = false,
  showErrors = false
}) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');

  const [formValues, setFormValues] = useState<SendGridFormValues>({
    templateId: '',
    fromAddress: '',
    testEmailAddress: ''
  });
  const [errors, setErrors] = useState<Partial<SendGridFormValues>>({});
  const [csvError, setCsvError] = useState<string>('');
  const [csvSuccess, setCsvSuccess] = useState<string>('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevSettingsRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  // Initialize form state from settings
  useEffect(() => {
    const settingsStr = JSON.stringify(settings);
    if (!hasInitializedRef.current || prevSettingsRef.current !== settingsStr) {
      setFormValues({
        templateId: (settings.templateId as string) || '',
        fromAddress: (settings.fromAddress as string) || '',
        testEmailAddress: (settings.testEmailAddress as string) || ''
      });
      setErrors({});
      prevSettingsRef.current = settingsStr;
      hasInitializedRef.current = true;
    }
  }, [settings]);

  // Validate and save when showErrors is true
  useEffect(() => {
    if (showErrors) {
      try {
        const validated = SendGridSettingsSchema.parse(formValues);
        setErrors({});
        onSave(validated);
      } catch (error) {
        if (error instanceof Error) {
          const message = error.message;
          // Parse Zod error message to set individual field errors
          if (message.includes('templateId'))
            setErrors(e => ({ ...e, templateId: t('validation-template-id-required') }));
          if (message.includes('fromAddress'))
            setErrors(e => ({ ...e, fromAddress: t('validation-from-address-required') }));
          if (message.includes('testEmailAddress'))
            setErrors(e => ({ ...e, testEmailAddress: t('validation-test-email-required') }));
        }
      }
    }
  }, [showErrors, formValues, onSave, t]);

  const handleFieldChange = useCallback(
    (field: keyof SendGridFormValues, value: string) => {
      setFormValues(prev => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    },
    [errors]
  );

  const handleCSVUpload = async (file: File) => {
    setCsvError('');
    setCsvSuccess('');

    if (!file.name.endsWith('.csv')) {
      setCsvError(t('csv-error-invalid-format'));
      return;
    }

    try {
      const csvContent = await file.text();
      const eventId = window.location.pathname.split('/')[3];

      const response = await fetch(`/api/integrations/sendgrid/${eventId}/upload-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent })
      });

      if (!response.ok) {
        const error = await response.json();
        setCsvError(error.error || t('csv-error-upload-failed'));
        return;
      }

      const result = await response.json();
      setCsvSuccess(t('csv-success-contacts-uploaded', { count: result.count }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setCsvError(error instanceof Error ? error.message : t('csv-error-upload-failed'));
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    try {
      const eventId = window.location.pathname.split('/')[3];
      const response = await fetch(`/api/integrations/sendgrid/${eventId}/send-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });

      if (!response.ok) {
        const error = await response.json();
        setCsvError(error.error || t('csv-error-send-test-failed'));
        return;
      }

      setCsvSuccess(t('csv-success-test-email-sent', { email: formValues.testEmailAddress }));
    } catch (error) {
      setCsvError(error instanceof Error ? error.message : t('csv-error-send-test-failed'));
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ py: 2 }}>
      <Stack spacing={1}>
        <TextField
          fullWidth
          label={t('template-id-label')}
          placeholder={t('template-id-placeholder')}
          value={formValues.templateId}
          onChange={e => handleFieldChange('templateId', e.target.value)}
          disabled={isLoading}
          error={showErrors && !!errors.templateId}
          helperText={showErrors && errors.templateId ? errors.templateId : t('template-id-help')}
          size="small"
        />
      </Stack>

      <Stack spacing={1}>
        <TextField
          fullWidth
          label={t('from-address-label')}
          type="email"
          placeholder={t('from-address-placeholder')}
          value={formValues.fromAddress}
          onChange={e => handleFieldChange('fromAddress', e.target.value)}
          disabled={isLoading}
          error={showErrors && !!errors.fromAddress}
          helperText={
            showErrors && errors.fromAddress ? errors.fromAddress : t('from-address-help')
          }
          size="small"
        />
      </Stack>

      <Stack spacing={1}>
        <TextField
          fullWidth
          label={t('test-email-address-label')}
          type="email"
          placeholder={t('test-email-address-placeholder')}
          value={formValues.testEmailAddress}
          onChange={e => handleFieldChange('testEmailAddress', e.target.value)}
          disabled={isLoading}
          error={showErrors && !!errors.testEmailAddress}
          helperText={
            showErrors && errors.testEmailAddress
              ? errors.testEmailAddress
              : t('test-email-address-help')
          }
          size="small"
        />
      </Stack>

      <Button
        variant="outlined"
        disabled={isTestingEmail || !formValues.fromAddress || !formValues.templateId}
        onClick={handleTestEmail}
      >
        {isTestingEmail ? <CircularProgress size={24} /> : t('send-test-email-button')}
      </Button>

      <Divider />

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
            {`Team Number,Region,Recipient Name,Recipient Email
1234,North,John Doe,john@example.com
5678,South,Jane Smith,jane@example.com
9999,Central,Bob Johnson,bob@example.com`}
          </Typography>
        </Paper>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            fullWidth
          >
            {t('upload-csv-button')}
          </Button>
        </Box>
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
      </Paper>

      {csvError && <Alert severity="error">{csvError}</Alert>}
      {csvSuccess && <Alert severity="success">{csvSuccess}</Alert>}
    </Stack>
  );
};

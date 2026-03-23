'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Stack,
  Divider,
  Alert,
  AlertTitle,
  Button,
  Typography,
  Paper,
  List,
  ListItem
} from '@mui/material';
import {
  Info as InfoIcon,
  Visibility as EyeIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { apiFetch } from '@lems/shared/fetch';
import { Flag } from '@lems/shared';
import type { SendGridSettings } from '@lems/shared/integrations';
import { useEvent } from '../../../../../components/event-context';
import { SendGridProvider, useSendGridContacts } from '../context';
import { SettingsSection } from './settings-section';
import { UploadContactsModal } from './upload-contacts-modal';
import { ViewAllModal } from './view-all-modal';

interface SendGridSettingsProps {
  settings: Record<string, unknown>;
  onSave: (settings: Record<string, unknown>) => void;
  isLoading?: boolean;
  showErrors?: boolean;
}

const SendGridSettingsContent: React.FC<SendGridSettingsProps> = ({
  settings,
  onSave,
  isLoading = false,
  showErrors = false
}) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');
  const event = useEvent();
  const { contacts } = useSendGridContacts();
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);

  const handleSave = useCallback(
    (validatedSettings: SendGridSettings) => {
      onSave({
        ...settings,
        ...validatedSettings
      });
    },
    [settings, onSave]
  );

  const handleTestEmail = async (validatedSettings: SendGridSettings) => {
    setIsTestingEmail(true);
    try {
      const response = await apiFetch(`/integrations/sendgrid/${event.id}/send-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedSettings)
      });

      if (!response.ok) {
        const error = await response.response.json();
        throw new Error(error.error || t('csv-error-send-test-failed'));
      }
    } finally {
      setIsTestingEmail(false);
    }
  };

  const contactSample = contacts.slice(0, 2);

  return (
    <Stack spacing={3} sx={{ py: 2 }}>
      <Stack>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {t('settings-title')}
        </Typography>
        <SettingsSection
          settings={settings}
          onSave={handleSave}
          onTestEmail={handleTestEmail}
          isLoading={isLoading}
          showErrors={showErrors}
          isTestingEmail={isTestingEmail}
        />
      </Stack>

      <Divider />

      <Alert severity="info" icon={<InfoIcon />}>
        <AlertTitle>{t('info-alert-title')}</AlertTitle>
        {t('info-alert-description')}
      </Alert>

      <Stack>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          {t('contacts-section-title')}
        </Typography>

        {contacts.length === 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'action.hover'
            }}
          >
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {t('no-contacts-uploaded')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => setUploadModalOpen(true)}
              sx={{ mt: 2 }}
            >
              {t('upload-contacts-button')}
            </Button>
          </Paper>
        )}

        {contacts.length > 0 && (
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t('contacts-count', { count: contacts.length })}
                </Typography>

                {contactSample.length > 0 && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      {t('contacts-preview-label')}
                    </Typography>
                    <List dense>
                      {contactSample.map(contact => (
                        <ListItem key={contact.team_number} disablePadding>
                          <Stack direction="row" spacing={1}>
                            <Flag region={contact.region} size={20} />
                            <Typography variant="body2">{`#${contact.team_number} - ${contact.recipient_email}`}</Typography>
                          </Stack>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Stack>
            </Paper>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => setUploadModalOpen(true)}
              >
                {t('upload-contacts-button')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<EyeIcon />}
                onClick={() => setViewAllModalOpen(true)}
              >
                {t('view-all-button')}
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>

      {/* Modals */}
      <UploadContactsModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
      <ViewAllModal isOpen={viewAllModalOpen} onClose={() => setViewAllModalOpen(false)} />
    </Stack>
  );
};

export const SendGridSettingsPanel: React.FC<SendGridSettingsProps> = props => {
  const event = useEvent();
  return (
    <SendGridProvider initialSettings={props.settings} eventId={event.id}>
      <SendGridSettingsContent {...props} />
    </SendGridProvider>
  );
};

'use client';

import { useTranslations } from 'next-intl';
import { CheckCircleOutline as CheckCircleIcon } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';

export interface ContactRecord {
  teamNumber: string;
  region: string;
  email: string;
}

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadAnother: () => void;
  successCount: number;
  errorCount: number;
  sampleContacts: ContactRecord[];
}

export const UploadModal: React.FC<UploadModalProps> = ({
  open,
  onClose,
  onUploadAnother,
  successCount,
  errorCount,
  sampleContacts
}) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');
  const moreCount = Math.max(0, successCount + errorCount - sampleContacts.length);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ color: 'success.main', display: 'flex' }}>
            <CheckCircleIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6">{t('csv-success-upload-title')}</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 2 }}>
          {/* Summary Stats */}
          <Stack direction="row" spacing={2}>
            <Chip
              label={t('csv-summary-successful', { count: successCount })}
              color="success"
              variant="outlined"
            />
            {errorCount > 0 && (
              <Chip
                label={t('csv-summary-errors', { count: errorCount })}
                color="error"
                variant="outlined"
              />
            )}
          </Stack>

          {/* Sample Contacts */}
          <Stack spacing={1}>
            <Typography variant="subtitle2">{t('csv-sample-contacts-title')}</Typography>
            <List dense>
              {sampleContacts.map((contact, index) => (
                <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={`${contact.teamNumber} • ${contact.email}`}
                    secondary={contact.region}
                    slotProps={{
                      primary: { variant: 'body2' },
                      secondary: { variant: 'caption' }
                    }}
                  />
                </ListItem>
              ))}
              {moreCount > 0 && (
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={t('csv-and-more-contacts', { count: moreCount })}
                    slotProps={{ primary: { variant: 'body2', sx: { fontStyle: 'italic' } } }}
                  />
                </ListItem>
              )}
            </List>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          {t('close-button')}
        </Button>
        <Button onClick={onUploadAnother} variant="contained">
          {t('upload-another-csv-button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

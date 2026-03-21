'use client';

import { useTranslations } from 'next-intl';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Stack,
  Typography,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { ContactRecord } from './upload-modal';

interface UploadedContactsProps {
  contacts: ContactRecord[];
  onReplace: () => void;
}

export const UploadedContacts: React.FC<UploadedContactsProps> = ({ contacts, onReplace }) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');
  const moreCount = Math.max(0, contacts.length - 5);
  const displayContacts = contacts.slice(0, 5);

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        {/* Header */}
        <Stack spacing={1}>
          <Typography variant="h6">{t('uploaded-contacts-title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('uploaded-contacts-description', { count: contacts.length })}
          </Typography>
        </Stack>

        <Divider />

        {/* Contact List */}
        <Stack spacing={1}>
          <Typography variant="subtitle2">{t('csv-sample-contacts-title')}</Typography>
          <List dense>
            {displayContacts.map((contact, index) => (
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

        <Divider />

        {/* Replace Button */}
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon sx={{ fontSize: 20 }} />}
          onClick={onReplace}
          fullWidth
        >
          {t('replace-contacts-button')}
        </Button>
      </Stack>
    </Paper>
  );
};

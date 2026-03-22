'use client';

import {
  Box,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  PaperProps
} from '@mui/material';
import { Info as InfoIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

export const UploadInstructions: React.FC<PaperProps> = props => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3 }} {...props}>
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
  );
};

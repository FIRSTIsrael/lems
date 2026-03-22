'use client';

import { Alert, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { ContactError } from '../../../types';

interface ErrorsSectionProps {
  errors: ContactError[];
}

export const ErrorsSection: React.FC<ErrorsSectionProps> = ({ errors }) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');

  if (errors.length === 0) return null;

  return (
    <Alert severity="warning" sx={{ width: '100%' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
        {t('csv-validation-errors', { count: errors.length })}
      </Typography>
      <List dense sx={{ mt: 1 }}>
        {errors.slice(0, 5).map((error, idx) => (
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
        {errors.length > 5 && (
          <ListItem disablePadding>
            <ListItemText
              primary={t('csv-error-and-more', { count: errors.length - 5 })}
              slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }}
            />
          </ListItem>
        )}
      </List>
    </Alert>
  );
};

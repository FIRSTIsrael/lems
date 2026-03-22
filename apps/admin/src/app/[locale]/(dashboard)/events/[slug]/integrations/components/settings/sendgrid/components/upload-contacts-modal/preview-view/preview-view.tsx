'use client';

import { Stack, Button, Typography } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { type UploadSummary } from '../upload-form';
import { ContactsListSection } from './contacts-list-section';
import { ErrorsSection } from './errors-section';

interface PreviewViewProps {
  result: UploadSummary;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PreviewView: React.FC<PreviewViewProps> = ({ result, onConfirm, onCancel }) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');

  return (
    <Stack spacing={3} alignItems="center">
      <Stack spacing={1} alignItems="center">
        <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />
        <Typography variant="h6" textAlign="center">
          {t('csv-success-title')}
        </Typography>
      </Stack>

      {result.added.length > 0 && (
        <ContactsListSection
          title={t('csv-success-added', { count: result.added.length })}
          contacts={result.added}
          moreLabel={t('csv-success-and-more', { count: result.added.length - 3 })}
        />
      )}

      {result.updated.length > 0 && (
        <ContactsListSection
          title={t('csv-success-updated', { count: result.updated.length })}
          contacts={result.updated}
          moreLabel={t('csv-success-and-more', { count: result.updated.length - 3 })}
        />
      )}

      <ErrorsSection errors={result.errors} />

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

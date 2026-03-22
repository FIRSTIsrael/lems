'use client';

import { Stack, Typography, Button, CircularProgress } from '@mui/material';
import { useTranslations } from 'next-intl';

interface DeleteConfirmationProps {
  teamNumber: number;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  teamNumber,
  loading,
  onConfirm,
  onCancel
}) => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        bgcolor: 'warning.lighter',
        p: 2,
        borderRadius: 1,
        alignItems: 'center'
      }}
    >
      <Typography variant="body2">{t('confirm-delete-contact', { teamNumber })}</Typography>
      <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
        <Button size="small" onClick={onCancel} disabled={loading}>
          {t('cancel')}
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? t('deleting') : t('delete')}
        </Button>
      </Stack>
    </Stack>
  );
};

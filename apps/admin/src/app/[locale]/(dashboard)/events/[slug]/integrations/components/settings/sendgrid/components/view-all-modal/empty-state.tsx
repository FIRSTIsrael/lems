'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

export const EmptyState: React.FC = () => {
  const t = useTranslations('pages.events.integrations.detail-panel.settings.sendgrid');

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 300,
        color: 'text.secondary'
      }}
    >
      <Typography>{t('no-contacts-uploaded')}</Typography>
    </Box>
  );
};

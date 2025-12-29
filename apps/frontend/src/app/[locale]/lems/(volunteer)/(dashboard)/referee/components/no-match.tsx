'use client';

import { Paper, Typography, Box, Button } from '@mui/material';
import { useTranslations } from 'next-intl';

export function RefereeNoMatch() {
  const t = useTranslations('pages.referee');

  return (
    <Paper
      elevation={1}
      sx={{
        p: 4,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: 2
      }}
    >
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
        {t('no-match-title')}
      </Typography>

      <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
        {t('no-match-description')}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontSize: '4rem' }}>
          ⏳
        </Typography>
      </Box>

      <Typography variant="caption" sx={{ color: '#999' }}>
        {t('no-match-instructions')}
      </Typography>
    </Paper>
  );
}

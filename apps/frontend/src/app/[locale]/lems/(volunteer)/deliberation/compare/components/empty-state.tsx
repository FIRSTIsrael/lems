'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography, Button } from '@mui/material';
import { CompareArrows } from '@mui/icons-material';
import Link from 'next/link';

export function EmptyState() {
  const t = useTranslations('layouts.deliberation.compare');

  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <CompareArrows sx={{ fontSize: 64, color: 'text.secondary', mb: 3 }} />
      <Typography variant="h5" color="text.secondary" gutterBottom>
        {t('no-teams-selected')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('no-teams-description')}
      </Typography>
      <Button component={Link} href="../deliberation" variant="contained" color="primary">
        {t('back-to-deliberation')}
      </Button>
    </Box>
  );
}

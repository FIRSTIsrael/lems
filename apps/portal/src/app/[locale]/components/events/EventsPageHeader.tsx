'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Typography } from '@mui/material';

export default function EventsPageHeader() {
  const t = useTranslations('pages.events');

  return (
    <Typography 
      variant="h3" 
      component="h1" 
      fontWeight="bold" 
      sx={{ 
        mb: 4,
        fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
      }}
    >
      {t('title')}
    </Typography>
  );
}

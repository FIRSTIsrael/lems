'use client';

import { useTranslations } from 'next-intl';
import { Paper, Typography, useTheme, Box } from '@mui/material';

export function PageHeader() {
  const t = useTranslations('components.pit-admin');
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        borderBottom: `2px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        maxWidth: 'lg',
        width: '100%',
        mx: 'auto'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' }
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {t('page-title')}
        </Typography>
      </Box>
    </Paper>
  );
}

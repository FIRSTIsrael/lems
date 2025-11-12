'use client';

import { useTranslations } from 'next-intl';
import { Paper, Stack, Typography, useTheme, useMediaQuery } from '@mui/material';

interface PageHeaderProps {
  eventName: string;
  divisionName: string;
}

export function PageHeader({ eventName, divisionName }: PageHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const t = useTranslations('components.pit-admin');

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
      <Stack
        direction={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'flex-start' : 'center'}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack spacing={0.5}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
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
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {`${eventName}${divisionName.trim() && ` • ${divisionName}`}`}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}

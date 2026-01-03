'use client';

import { Paper, Typography, Box, Stack, Avatar } from '@mui/material';
import { Schedule, LocalCafe } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

export function RefereeNoMatch() {
  const t = useTranslations('pages.referee');

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: 'background.paper'
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center', backgroundColor: 'primary.main' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
          {t('no-match-title')}
        </Typography>
      </Box>

      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Stack spacing={3} alignItems="center">
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'grey.100',
              color: 'text.secondary'
            }}
          >
            <Schedule sx={{ fontSize: '2.5rem' }} />
          </Avatar>

          <Stack spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {t('no-match-instructions')}
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              backgroundColor: 'grey.50',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <LocalCafe sx={{ fontSize: '1.25rem', color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {t('break-message')}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

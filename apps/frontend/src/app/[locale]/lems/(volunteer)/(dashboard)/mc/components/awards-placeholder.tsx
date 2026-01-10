'use client';

import { useTranslations } from 'next-intl';
import { Paper, Typography, Stack, Box } from '@mui/material';
import { EmojiEvents, LockRounded } from '@mui/icons-material';
import { useMc } from './mc-context';

export const AwardsPlaceholder: React.FC = () => {
  const t = useTranslations('pages.mc.awards');
  const { awardsAssigned } = useMc();

  if (!awardsAssigned) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: 'error.lighter',
          border: '2px solid',
          borderColor: 'error.main'
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box sx={{ opacity: 0.6, color: 'error.main' }}>
            <LockRounded sx={{ fontSize: 80 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
            {t('blocked.title')}
          </Typography>
          <Typography variant="body2" sx={{ maxWidth: 600, color: 'error.main' }}>
            {t('blocked.description')}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 4,
        textAlign: 'center',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Box sx={{ opacity: 0.3 }}>
          <EmojiEvents sx={{ fontSize: 80 }} />
        </Box>
        <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600 }}>
          {t('title')}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 600 }}>
          {t('description')}
        </Typography>
      </Stack>
    </Paper>
  );
};

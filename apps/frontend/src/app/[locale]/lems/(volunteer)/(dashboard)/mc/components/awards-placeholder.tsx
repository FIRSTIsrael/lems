'use client';

import { useTranslations } from 'next-intl';
import { Paper, Typography, Stack, Box } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

export const AwardsPlaceholder: React.FC = () => {
  const t = useTranslations('pages.mc.awards');

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

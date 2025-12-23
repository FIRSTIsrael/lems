'use client';

import { Container, Paper, Typography, Box, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';

export const SmallScreenBlock = () => {
  const t = useTranslations('pages.deliberations.category.small-screen-block');
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          width: '100%',
          px: 2
        }}
      >
        <Paper sx={{ p: { xs: 2, sm: 4, md: 6 }, textAlign: 'center' }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 700, color: theme.palette.primary.main }}
          >
            {t('title')}
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 2 }}>
            {t('message')}
          </Typography>
          <Typography
            variant="caption"
            display="block"
            sx={{ color: theme.palette.text.disabled, mt: 3 }}
          >
            {t('minimum-width')}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

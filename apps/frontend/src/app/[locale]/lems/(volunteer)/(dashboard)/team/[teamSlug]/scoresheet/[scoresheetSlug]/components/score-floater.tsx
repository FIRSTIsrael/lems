'use client';

import { Paper, Stack, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';

interface ScoreFloaterProps {
  score: number;
}

export const ScoreFloater: React.FC<ScoreFloaterProps> = ({ score }) => {
  const theme = useTheme();
  const t = useTranslations('layouts.scoresheet');

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        p: 3,
        minWidth: 180,
        boxShadow: theme.shadows[6],
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1000,
        '@media (max-width: 640px)': {
          bottom: 16,
          right: 16,
          p: 2,
          minWidth: 160
        }
      }}
      elevation={0}
    >
      <Stack spacing={1.5} alignItems="center">
        <Stack alignItems="center" spacing={0.5}>
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center'
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                transition: 'color 0.3s ease',
                fontSize: { xs: '2rem', sm: '2.5rem' }
              }}
            >
              {score}
            </Typography>
            <Typography
              sx={{
                marginLeft: 0.5,
                fontWeight: 600,
                color: 'text.secondary',
                transition: 'color 0.3s ease',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {t('points-unit')}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};

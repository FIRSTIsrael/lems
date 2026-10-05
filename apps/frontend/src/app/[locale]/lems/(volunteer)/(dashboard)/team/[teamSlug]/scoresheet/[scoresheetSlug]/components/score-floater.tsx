'use client';

import { Paper, Stack, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useScoresheetGeneralTranslations } from '@lems/localization';
import type { Edition } from '@lems/shared/edition';

interface ScoreFloaterProps {
  score: number;
  scoreOverridden?: boolean;
  edition: Edition;
}

export const ScoreFloater: React.FC<ScoreFloaterProps> = ({
  score,
  scoreOverridden = false,
  edition
}) => {
  const theme = useTheme();
  const t = useTranslations('layouts.scoresheet');
  const { getTerm } = useScoresheetGeneralTranslations(edition);

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
      <Stack
        spacing={1.5}
        sx={{
          alignItems: 'center'
        }}
      >
        <Stack
          spacing={0.5}
          sx={{
            alignItems: 'center'
          }}
        >
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
          {scoreOverridden && (
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: 'text.secondary',
                textAlign: 'center'
              }}
            >
              {getTerm('score-overridden')}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

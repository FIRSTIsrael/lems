'use client';

import { useTranslations } from 'next-intl';
import { Box, Paper, Typography, Button } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';

interface JudgingTimerSetupProps {
  onStart: () => void;
}

export const JudgingTimerSetup: React.FC<JudgingTimerSetupProps> = ({ onStart }) => {
  const t = useTranslations('pages.tools.judging-timer');

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%)'
      }}
    >
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          maxWidth: 500,
          width: '90%'
        }}
      >
        <Typography variant="h3" gutterBottom fontWeight={600}>
          {t('title')}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 6 }}>
          {t('subtitle')}
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrow />}
          onClick={onStart}
          sx={{ px: 6, py: 3, fontSize: '1.2rem' }}
        >
          {t('start-session')}
        </Button>
      </Paper>
    </Box>
  );
};


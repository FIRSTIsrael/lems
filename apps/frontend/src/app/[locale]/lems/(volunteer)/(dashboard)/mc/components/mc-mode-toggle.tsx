'use client';

import { Button, ButtonGroup } from '@mui/material';
import { useTranslations } from 'next-intl';

export type McMode = 'matches' | 'awards';

interface McModeToggleProps {
  mode: McMode;
  setMode: (mode: McMode) => void;
}

export const McModeToggle: React.FC<McModeToggleProps> = ({ mode, setMode }) => {
  const t = useTranslations('pages.mc');

  return (
    <ButtonGroup variant="outlined">
      <Button
        onClick={() => setMode('matches')}
        variant={mode === 'matches' ? 'contained' : 'outlined'}
        sx={{
          textTransform: 'none',
          fontSize: '0.9375rem',
          fontWeight: 500,
          px: 2,
          py: 0.75
        }}
      >
        {t('mode.matches')}
      </Button>
      <Button
        onClick={() => setMode('awards')}
        variant={mode === 'awards' ? 'contained' : 'outlined'}
        sx={{
          textTransform: 'none',
          fontSize: '0.9375rem',
          fontWeight: 500,
          px: 2,
          py: 0.75
        }}
      >
        {t('mode.awards')}
      </Button>
    </ButtonGroup>
  );
};

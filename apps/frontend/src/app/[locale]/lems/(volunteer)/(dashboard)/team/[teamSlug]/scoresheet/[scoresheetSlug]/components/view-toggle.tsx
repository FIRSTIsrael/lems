'use client';

import { Button, ButtonGroup } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useScoresheet } from '../scoresheet-context';

export const HeadRefViewToggle: React.FC = () => {
  const t = useTranslations('pages.scoresheet');
  const { viewMode, setViewMode } = useScoresheet();

  return (
    <ButtonGroup variant="outlined" sx={{ height: '40px' }}>
      <Button
        onClick={() => setViewMode('score')}
        variant={viewMode === 'score' ? 'contained' : 'outlined'}
        sx={{
          textTransform: 'none',
          fontSize: '0.9375rem',
          fontWeight: 500,
          px: 2,
          py: 0.75
        }}
      >
        {t('view.score')}
      </Button>
      <Button
        onClick={() => setViewMode('gp')}
        variant={viewMode === 'gp' ? 'contained' : 'outlined'}
        sx={{
          textTransform: 'none',
          fontSize: '0.9375rem',
          fontWeight: 500,
          px: 2,
          py: 0.75
        }}
      >
        {t('view.gp')}
      </Button>
    </ButtonGroup>
  );
};

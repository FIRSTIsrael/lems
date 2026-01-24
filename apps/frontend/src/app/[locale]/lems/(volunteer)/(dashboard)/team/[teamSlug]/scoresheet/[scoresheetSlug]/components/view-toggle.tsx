'use client';

import { Button, ButtonGroup } from '@mui/material';
import { useTranslations } from 'next-intl';

export type ScoresheetView = 'score' | 'gp';

interface HeadRefViewToggleProps {
  view: ScoresheetView;
  setView: (mode: ScoresheetView) => void;
}

export const HeadRefViewToggle: React.FC<HeadRefViewToggleProps> = ({ view, setView }) => {
  const t = useTranslations('pages.scoresheet');

  return (
    <ButtonGroup variant="outlined" sx={{ height: '40px' }}>
      <Button
        onClick={() => setView('score')}
        variant={view === 'score' ? 'contained' : 'outlined'}
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
        onClick={() => setView('gp')}
        variant={view === 'gp' ? 'contained' : 'outlined'}
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

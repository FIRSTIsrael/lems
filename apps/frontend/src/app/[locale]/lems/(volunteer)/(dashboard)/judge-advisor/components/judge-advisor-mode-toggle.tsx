'use client';

import { Button, ButtonGroup } from '@mui/material';
import { useTranslations } from 'next-intl';

export type JudgeAdvisorMode = 'judging' | 'awards';

interface JudgeAdvisorModeToggleProps {
  mode: JudgeAdvisorMode;
  setMode: (mode: JudgeAdvisorMode) => void;
}

export const JudgeAdvisorModeToggle: React.FC<JudgeAdvisorModeToggleProps> = ({
  mode,
  setMode
}) => {
  const t = useTranslations('pages.judge-advisor');

  return (
    <ButtonGroup variant="outlined">
      <Button
        onClick={() => setMode('judging')}
        variant={mode === 'judging' ? 'contained' : 'outlined'}
        sx={{
          textTransform: 'none',
          fontSize: '0.9375rem',
          fontWeight: 500,
          px: 2,
          py: 0.75
        }}
      >
        {t('mode.judging')}
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

'use client';

import { ToggleButton, ToggleButtonGroup } from '@mui/material';
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

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: JudgeAdvisorMode | null
  ) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  return (
    <ToggleButtonGroup
      value={mode}
      exclusive
      onChange={handleModeChange}
      aria-label="judge advisor mode"
      size="small"
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        '& .MuiToggleButton-root': {
          textTransform: 'none',
          fontSize: '0.9375rem',
          fontWeight: 500,
          px: 2,
          py: 0.75,
          border: 'none',
          '&.Mui-selected': {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          },
          '&:not(.Mui-selected)': {
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }
        }
      }}
    >
      <ToggleButton value="judging" aria-label="judging mode">
        {t('mode.judging')}
      </ToggleButton>
      <ToggleButton value="awards" aria-label="awards mode">
        {t('mode.awards')}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

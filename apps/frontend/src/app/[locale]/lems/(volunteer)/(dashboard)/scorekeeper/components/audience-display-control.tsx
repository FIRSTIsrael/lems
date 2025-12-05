'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Typography, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import { MonitorRounded, SlideshowRounded } from '@mui/icons-material';

export type AudienceDisplayMode = 'scoreboard' | 'match-preview';

interface AudienceDisplayControlProps {
  currentMode: AudienceDisplayMode;
  onModeChange: (mode: AudienceDisplayMode) => void;
  isLoading?: boolean;
}

export function AudienceDisplayControl({
  currentMode,
  onModeChange,
  isLoading = false
}: AudienceDisplayControlProps) {
  const t = useTranslations('pages.scorekeeper.audience-display');
  const theme = useTheme();
  const [isChanging, setIsChanging] = useState(false);

  const handleModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: AudienceDisplayMode | null
  ) => {
    if (newMode !== null && newMode !== currentMode) {
      setIsChanging(true);
      onModeChange(newMode);
      setTimeout(() => setIsChanging(false), 300);
    }
  };

  return (
    <Paper
      sx={{
        p: 1.5,
        bgcolor: 'background.paper',
        height: '100%'
      }}
    >
      {/* Compact toggle buttons */}
      <ToggleButtonGroup
        value={currentMode}
        exclusive
        onChange={handleModeChange}
        disabled={isLoading || isChanging}
        size="small"
        sx={{
          display: 'flex',
          gap: 0.5,
          ml: 'auto',
          '& .MuiToggleButton-root': {
            px: 1.25,
            py: 0.5,
            fontSize: '0.75rem',
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 0.75,
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            '&:hover': {
              bgcolor: 'action.hover'
            },
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderColor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }
          }
        }}
      >
        <ToggleButton value="scoreboard" aria-label="scoreboard">
          <MonitorRounded sx={{ fontSize: '1rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {t('modes.scoreboard')}
          </Typography>
        </ToggleButton>
        <ToggleButton value="match-preview" aria-label="match-preview">
          <SlideshowRounded sx={{ fontSize: '1rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {t('modes.match-preview')}
          </Typography>
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
}

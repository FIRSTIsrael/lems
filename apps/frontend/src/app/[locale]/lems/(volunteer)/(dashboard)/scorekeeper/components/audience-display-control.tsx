'use client';

import { useTranslations } from 'next-intl';
import { Paper, Typography, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import {
  LeaderboardRounded,
  VisibilityRounded,
  BusinessRounded,
  ImageRounded,
  AnnouncementRounded,
  EmojiEventsRounded
} from '@mui/icons-material';

export type AudienceDisplayMode =
  | 'scoreboard'
  | 'match-preview'
  | 'sponsors'
  | 'logo'
  | 'message'
  | 'awards';

export function AudienceDisplayControl() {
  const t = useTranslations('pages.scorekeeper.audience-display');
  const theme = useTheme();

  const currentMode = 'scoreboard'; // TODO: Get from state

  return (
    <Paper
      sx={{
        p: 1.5,
        bgcolor: 'background.paper',
        height: '100%'
      }}
    >
      <ToggleButtonGroup
        value={currentMode}
        exclusive
        onChange={(_, newMode: AudienceDisplayMode) => {
          console.log('Change audience display mode to:', newMode);
        }}
        disabled={false}
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
          <LeaderboardRounded sx={{ fontSize: '1.15rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {t('modes.scoreboard')}
          </Typography>
        </ToggleButton>
        <ToggleButton value="match-preview" aria-label="match-preview">
          <VisibilityRounded sx={{ fontSize: '1.15rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {t('modes.match-preview')}
          </Typography>
        </ToggleButton>
        <ToggleButton value="sponsors" aria-label="sponsors" disabled>
          <BusinessRounded sx={{ fontSize: '1.15rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {t('modes.sponsors')}
          </Typography>
        </ToggleButton>
        <ToggleButton value="logo" aria-label="logo" disabled>
          <ImageRounded sx={{ fontSize: '1.15rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {t('modes.logo')}
          </Typography>
        </ToggleButton>
        <ToggleButton value="message" aria-label="message" disabled>
          <AnnouncementRounded sx={{ fontSize: '1.15rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {t('modes.message')}
          </Typography>
        </ToggleButton>
        <ToggleButton value="awards" aria-label="awards" disabled>
          <EmojiEventsRounded sx={{ fontSize: '1.15rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {t('modes.awards')}
          </Typography>
        </ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
}

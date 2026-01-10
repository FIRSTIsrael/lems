'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  IconButton,
  Stack
} from '@mui/material';
import {
  LeaderboardRounded,
  VisibilityRounded,
  BusinessRounded,
  ImageRounded,
  AnnouncementRounded,
  EmojiEventsRounded,
  SettingsRounded
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import { AudienceDisplayScreen, SWITCH_AUDIENCE_DISPLAY_MUTATION } from '../graphql';
import { useEvent } from '../../../components/event-context';
import { useScorekeeperData } from './scorekeeper-context';
import { AudienceDisplaySettingsModal } from './audience-display-settings-modal';

export function AudienceDisplayControl() {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const { currentDivision } = useEvent();

  const t = useTranslations('pages.scorekeeper.audience-display');
  const theme = useTheme();
  const { audienceDisplay, awardsAssigned } = useScorekeeperData();

  const [switchAudienceDisplay] = useMutation(SWITCH_AUDIENCE_DISPLAY_MUTATION, {
    onError: () => {
      toast.error(t('errors.audience-display-switch'));
    }
  });

  const currentMode = audienceDisplay?.activeDisplay || 'scoreboard';

  return (
    <>
      <Paper
        sx={{
          p: 1.5,
          bgcolor: 'background.paper',
          height: '100%'
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ToggleButtonGroup
            value={currentMode}
            exclusive
            onChange={(_, newDisplay: AudienceDisplayScreen) => {
              switchAudienceDisplay({
                variables: {
                  divisionId: currentDivision.id,
                  newDisplay
                }
              });
            }}
            disabled={false}
            size="small"
            sx={{
              display: 'flex',
              gap: 0.5,
              flex: 1,
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
            <ToggleButton value="match_preview" aria-label="match-preview">
              <VisibilityRounded sx={{ fontSize: '1.15rem' }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {t('modes.match-preview')}
              </Typography>
            </ToggleButton>
            <ToggleButton value="sponsors" aria-label="sponsors">
              <BusinessRounded sx={{ fontSize: '1.15rem' }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {t('modes.sponsors')}
              </Typography>
            </ToggleButton>
            <ToggleButton value="logo" aria-label="logo">
              <ImageRounded sx={{ fontSize: '1.15rem' }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {t('modes.logo')}
              </Typography>
            </ToggleButton>
            <ToggleButton value="message" aria-label="message">
              <AnnouncementRounded sx={{ fontSize: '1.15rem' }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {t('modes.message')}
              </Typography>
            </ToggleButton>
            <ToggleButton value="awards" aria-label="awards" disabled={!awardsAssigned}>
              <EmojiEventsRounded sx={{ fontSize: '1.15rem' }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {t('modes.awards')}
              </Typography>
            </ToggleButton>
          </ToggleButtonGroup>
          <IconButton
            size="small"
            onClick={() => setSettingsModalOpen(true)}
            title={t('settings-button-title')}
            sx={{
              color: 'action.active',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <SettingsRounded sx={{ fontSize: '1.25rem' }} />
          </IconButton>
        </Stack>
      </Paper>
      <AudienceDisplaySettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </>
  );
}

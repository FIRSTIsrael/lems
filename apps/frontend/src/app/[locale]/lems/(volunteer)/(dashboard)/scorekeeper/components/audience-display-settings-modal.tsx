'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client/react';
import { UPDATE_AUDIENCE_DISPLAY_SETTING_MUTATION } from '../graphql';
import { useEvent } from '../../../components/event-context';
import { useScorekeeperData } from './scorekeeper-context';

interface AudienceDisplaySettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function AudienceDisplaySettingsModal({ open, onClose }: AudienceDisplaySettingsModalProps) {
  const { currentDivision } = useEvent();
  const { audienceDisplay } = useScorekeeperData();
  const t = useTranslations('pages.scorekeeper.audience-display.settings-modal');

  const [messageValue, setMessageValue] = useState(
    (audienceDisplay?.settings?.message?.value as string) || ''
  );

  const [awardWinnerSlideStyle, setAwardWinnerSlideStyle] = useState<'chroma' | 'full' | 'both'>(
    (audienceDisplay?.settings?.awards?.awardWinnerSlideStyle as 'chroma' | 'full' | 'both') ||
      'full'
  );

  const [updateAudienceDisplaySetting] = useMutation(UPDATE_AUDIENCE_DISPLAY_SETTING_MUTATION, {
    onError: () => {
      toast.error(t('errors.update-failed'));
    }
  });

  const handleMessageBlur = async () =>
    await updateAudienceDisplaySetting({
      variables: {
        divisionId: currentDivision.id,
        display: 'message',
        settingKey: 'value',
        settingValue: messageValue
      }
    });

  const handleShowActiveMatchChange = async (checked: boolean) =>
    await updateAudienceDisplaySetting({
      variables: {
        divisionId: currentDivision.id,
        display: 'scoreboard',
        settingKey: 'showActiveMatch',
        settingValue: checked
      }
    });

  const handleShowPreviousMatchChange = async (checked: boolean) =>
    await updateAudienceDisplaySetting({
      variables: {
        divisionId: currentDivision.id,
        display: 'scoreboard',
        settingKey: 'showPreviousMatch',
        settingValue: checked
      }
    });

  const handleShowSponsorsRowChange = async (checked: boolean) =>
    await updateAudienceDisplaySetting({
      variables: {
        divisionId: currentDivision.id,
        display: 'scoreboard',
        settingKey: 'showSponsorsRow',
        settingValue: checked
      }
    });

  const handleAwardWinnerSlideStyleChange = async (style: 'chroma' | 'full' | 'both') => {
    setAwardWinnerSlideStyle(style);
    await updateAudienceDisplaySetting({
      variables: {
        divisionId: currentDivision.id,
        display: 'awards',
        settingKey: 'awardWinnerSlideStyle',
        settingValue: style
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}
            >
              {t('sections.message')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={messageValue}
              onChange={e => setMessageValue(e.target.value)}
              onBlur={handleMessageBlur}
              placeholder={t('fields.message-placeholder')}
              variant="outlined"
              size="small"
            />
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}
            >
              {t('sections.scoreboard')}
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={
                      (audienceDisplay?.settings?.scoreboard?.showActiveMatch as boolean) || false
                    }
                    onChange={e => handleShowActiveMatchChange(e.target.checked)}
                  />
                }
                label={t('fields.show-active-match')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={
                      (audienceDisplay?.settings?.scoreboard?.showPreviousMatch as boolean) || false
                    }
                    onChange={e => handleShowPreviousMatchChange(e.target.checked)}
                  />
                }
                label={t('fields.show-previous-match')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={
                      (audienceDisplay?.settings?.scoreboard?.showSponsorsRow as boolean) || false
                    }
                    onChange={e => handleShowSponsorsRowChange(e.target.checked)}
                  />
                }
                label={t('fields.show-sponsors-row')}
              />
            </Stack>
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}
            >
              {t('sections.awards')}
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>{t('fields.award-winner-slide-style')}</InputLabel>
              <Select
                value={awardWinnerSlideStyle}
                label={t('fields.award-winner-slide-style')}
                onChange={e =>
                  handleAwardWinnerSlideStyleChange(e.target.value as 'chroma' | 'full' | 'both')
                }
              >
                <MenuItem value="chroma">{t('fields.award-slide-style-chroma')}</MenuItem>
                <MenuItem value="full">{t('fields.award-slide-style-full')}</MenuItem>
                <MenuItem value="both">{t('fields.award-slide-style-both')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  );
}

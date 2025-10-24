'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { KeyedMutator, mutate } from 'swr';
import { useTranslations } from 'next-intl';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Button,
  CircularProgress,
  Grid,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { EventSettings } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { useEvent } from '../../components/event-context';

interface EventSettingsSectionProps {
  settings: EventSettings;
  mutateSettings: KeyedMutator<EventSettings>;
  setAlert: (alert: { type: 'success' | 'error'; message: string } | null) => void;
}

export const EventSettingsSection: React.FC<EventSettingsSectionProps> = ({
  settings,
  mutateSettings,
  setAlert
}) => {
  const t = useTranslations('pages.events.settings');
  const event = useEvent();

  const { data: teams = [] } = useSWR(`/admin/events/${event.id}/teams`, {
    suspense: false,
    fallbackData: []
  });

  const [isSaving, setIsSaving] = useState(false);

  const [advancementPercent, setAdvancementPercent] = useState<number>(
    settings.advancementPercent || 50
  );

  const [visible, setVisible] = useState<boolean>(settings.visible || false);
  const [eventType, setEventType] = useState<'OFFSEASON' | 'OFFICIAL'>(
    settings.eventType || 'OFFICIAL'
  );

  const totalTeams = teams.length;
  const advancingTeams = Math.round((totalTeams * advancementPercent) / 100);

  useEffect(() => {
    if (settings) {
      setAdvancementPercent(settings.advancementPercent);
      setVisible(settings.visible);
      setEventType(settings.eventType);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    setAlert(null);

    try {
      const response = await apiFetch(`/admin/events/${event.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          advancementPercent,
          visible,
          eventType
        })
      });

      if (response.ok) {
        await mutateSettings();
        await mutate(`/admin/events/season/${event.seasonId}/summary`);
        setAlert({ type: 'success', message: t('messages.save-success') });
      } else {
        setAlert({ type: 'error', message: t('messages.save-error') });
      }
    } catch {
      setAlert({ type: 'error', message: t('messages.save-error') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('event-settings.title')}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={visible}
                onChange={(_, checked) => setVisible(checked)}
                color="primary"
              />
            }
            label={t('event-settings.visible')}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {t('event-settings.visible-description')}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>{t('event-settings.event-type')}</InputLabel>
            <Select
              value={eventType}
              label={t('event-settings.event-type')}
              onChange={e => setEventType(e.target.value as 'OFFSEASON' | 'OFFICIAL')}
            >
              <MenuItem value="OFFICIAL">{t('event-settings.event-type-official')}</MenuItem>
              <MenuItem value="OFFSEASON">{t('event-settings.event-type-offseason')}</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {t('event-settings.event-type-description')}
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mt: 1, mb: 4 }} alignItems="center">
          <Grid size={3}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('event-settings.advancement-percent')}
              {totalTeams > 0 && (
                <Typography component="span" variant="body2" color="primary" sx={{ ml: 1 }}>
                  {t('event-settings.advancing-teams', { advancingTeams, totalTeams })}
                </Typography>
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('event-settings.advancement-percent-description')}
            </Typography>
            <Box sx={{ px: 2, mt: 5 }}>
              <Slider
                value={advancementPercent}
                onChange={(_, value) => setAdvancementPercent(value as number)}
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="on"
                valueLabelFormat={value => `${value}%`}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' }
                ]}
              />
            </Box>
          </Grid>
          <Grid size={9} />
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={
              isSaving ||
              (advancementPercent === settings.advancementPercent &&
                visible === settings.visible &&
                eventType === settings.eventType)
            }
            startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
          >
            {isSaving ? t('event-settings.saving') : t('event-settings.save-button')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

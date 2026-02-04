'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Switch
} from '@mui/material';
import { EventSettings, TeamWithDivision } from '@lems/types/api/admin';
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

  const { data: allTeams = [] } = useSWR<TeamWithDivision[]>(`/admin/events/${event.id}/teams`, {
    suspense: false,
    fallbackData: []
  });

  const [isSaving, setIsSaving] = useState(false);

  const [advancementPercent, setAdvancementPercent] = useState<number>(
    settings.advancementPercent || 50
  );

  const [visible, setVisible] = useState<boolean>(settings.visible || false);
  const [official, setOfficial] = useState<boolean>(settings.official || true);

  const { advancingTeams, totalTeams } = useMemo(() => {
    const total = allTeams.length;
    let advancing = 0;

    const teamsByDivision: Record<string, number> = {};
    allTeams.forEach(team => {
      teamsByDivision[team.division.id] ??= 0;
      teamsByDivision[team.division.id] += 1;
    });

    Object.values(teamsByDivision).forEach(divisionTeamCount => {
      advancing += Math.round((divisionTeamCount * advancementPercent) / 100);
    });

    return { advancingTeams: advancing, totalTeams: total };
  }, [allTeams, advancementPercent]);

  useEffect(() => {
    if (settings) {
      setAdvancementPercent(settings.advancementPercent);
      setVisible(settings.visible);
      setOfficial(settings.official);
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
          official
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

        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid size={3}>
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
            <FormControlLabel
              control={
                <Switch
                  checked={official}
                  onChange={(_, checked) => setOfficial(checked)}
                  color="primary"
                />
              }
              sx={{ mt: 2 }}
              label={t('event-settings.official')}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {t('event-settings.official-description')}
            </Typography>
          </Grid>

          <Grid size={4} spacing={3} sx={{ mt: 1, mb: 4 }} alignItems="center">
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
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={
              isSaving ||
              (advancementPercent === settings.advancementPercent &&
                visible === settings.visible &&
                official === settings.official)
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

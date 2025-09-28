"use client";

import React, { useState, useEffect } from "react";
import { KeyedMutator } from "swr";
import { useTranslations } from "next-intl";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";
import { EventSettings } from "@lems/types/api/admin";
import { apiFetch } from "@lems/shared";
import { useEvent } from "../../components/event-context";

interface EventSettingsSectionProps {
  settings: EventSettings;
  mutateSettings: KeyedMutator<EventSettings>;
  setAlert: (
    alert: { type: "success" | "error"; message: string } | null
  ) => void;
}

export const EventSettingsSection: React.FC<EventSettingsSectionProps> = ({
  settings,
  mutateSettings,
  setAlert,
}) => {
  const t = useTranslations("pages.events.settings");
  const event = useEvent();

  const [isSaving, setIsSaving] = useState(false);

  const [advancementPercent, setAdvancementPercent] = useState<number>(
    settings.advancementPercent || 50
  );

  useEffect(() => {
    if (settings) {
      setAdvancementPercent(settings.advancementPercent);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    setAlert(null);

    try {
      const response = await apiFetch(`/admin/events/${event.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          advancementPercent,
        }),
      });

      if (response.ok) {
        await mutateSettings();
        setAlert({ type: "success", message: t("messages.save-success") });
      } else {
        setAlert({ type: "error", message: t("messages.save-error") });
      }
    } catch {
      setAlert({ type: "error", message: t("messages.save-error") });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("event-settings.title")}
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1, mb: 4 }} alignItems="center">
          <Grid size={3}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t("event-settings.advancement-percent")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("event-settings.advancement-percent-description")}
            </Typography>
            <Box sx={{ px: 2, mt: 5 }}>
              <Slider
                value={advancementPercent}
                onChange={(_, value) => setAdvancementPercent(value as number)}
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="on"
                valueLabelFormat={(value) => `${value}%`}
                marks={[
                  { value: 0, label: "0%" },
                  { value: 25, label: "25%" },
                  { value: 50, label: "50%" },
                  { value: 75, label: "75%" },
                  { value: 100, label: "100%" },
                ]}
              />
            </Box>
          </Grid>
          <Grid size={9} />
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={
              isSaving || advancementPercent === settings.advancementPercent
            }
            startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
          >
            {isSaving
              ? t("event-settings.saving")
              : t("event-settings.save-button")}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Button,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  useTheme,
  Grid,
} from "@mui/material";
import { EventSettings } from "@lems/types/api/admin";
import { apiFetch } from "@lems/shared";
import { EventPageTitle } from "../components/event-page-title";
import { useEvent } from "../components/event-context";
import { CompleteEventDialog } from "./components/complete-event-dialog";
import { PublishEventDialog } from "./components/publish-event-dialog";

const SettingsPage: React.FC = () => {
  const t = useTranslations("pages.events.settings");
  const theme = useTheme();
  const event = useEvent();

  const {
    data: settings,
    mutate: mutateSettings,
    error,
  } = useSWR<EventSettings>(`/admin/events/${event.id}/settings`, {
    suspense: false,
  });

  const [advancementPercent, setAdvancementPercent] = useState<number>(
    settings?.advancementPercent || 50
  );
  const [isSaving, setIsSaving] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Update local state when settings change
  React.useEffect(() => {
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

  const handleCompleteEvent = async () => {
    setAlert(null);
    try {
      const response = await apiFetch(
        `/admin/events/${event.id}/settings/complete`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        await mutateSettings();
        setAlert({ type: "success", message: t("messages.complete-success") });
        setCompleteDialogOpen(false);
      } else {
        setAlert({ type: "error", message: t("messages.complete-error") });
      }
    } catch {
      setAlert({ type: "error", message: t("messages.complete-error") });
    }
  };

  const handlePublishEvent = async () => {
    setAlert(null);
    try {
      const response = await apiFetch(
        `/admin/events/${event.id}/settings/publish`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        await mutateSettings();
        setAlert({ type: "success", message: t("messages.publish-success") });
        setPublishDialogOpen(false);
      } else {
        setAlert({ type: "error", message: t("messages.publish-error") });
      }
    } catch {
      setAlert({ type: "error", message: t("messages.publish-error") });
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <EventPageTitle title={t("title", { eventName: event.name })} />
        <Alert severity="error" sx={{ mt: 2 }}>
          {t("messages.load-error")}
        </Alert>
      </Box>
    );
  }

  if (!settings) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <EventPageTitle title={t("title", { eventName: event.name })} />

      {alert && (
        <Alert
          severity={alert.type}
          sx={{ mt: 2, mb: 3 }}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      <Stack spacing={4}>
        {/* Event Settings Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("event-settings.title")}
            </Typography>

            <Grid
              container
              spacing={3}
              sx={{ mt: 1, mb: 4 }}
              alignItems="center"
            >
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
                    onChange={(_, value) =>
                      setAdvancementPercent(value as number)
                    }
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
                startIcon={
                  isSaving ? <CircularProgress size={16} /> : undefined
                }
              >
                {isSaving
                  ? t("event-settings.saving")
                  : t("event-settings.save-button")}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Event Actions Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("event-actions.title")}
            </Typography>

            <Stack spacing={3} sx={{ mt: 3 }}>
              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    color="primary"
                    disabled={settings.completed}
                    onClick={() => setCompleteDialogOpen(true)}
                    sx={{ minWidth: 160 }}
                  >
                    {t("event-actions.complete-event")}
                  </Button>
                  <Box>
                    <Typography variant="body2">
                      {t("event-actions.complete-event-description")}
                    </Typography>
                    {settings.completed && (
                      <Typography variant="caption" color="text.secondary">
                        {t("event-actions.already-completed")}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    color="primary"
                    disabled={!settings.completed || settings.published}
                    onClick={() => setPublishDialogOpen(true)}
                    sx={{ minWidth: 160 }}
                  >
                    {t("event-actions.publish-event")}
                  </Button>
                  <Box>
                    <Typography variant="body2">
                      {t("event-actions.publish-event-description")}
                    </Typography>
                    {settings.published && (
                      <Typography variant="caption" color="text.secondary">
                        {t("event-actions.already-published")}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Danger Zone Section */}
        <Card sx={{ border: `2px solid ${theme.palette.error.main}` }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error">
              {t("danger-zone.title")}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  color="error"
                  disabled={true}
                  sx={{ minWidth: 160 }}
                >
                  {t("danger-zone.delete-event")}
                </Button>
                <Box>
                  <Typography variant="body2">
                    {t("danger-zone.delete-event-description")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("danger-zone.delete-disabled")}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* Dialogs */}
      <CompleteEventDialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        onConfirm={handleCompleteEvent}
        eventName={event.name}
      />

      <PublishEventDialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        onConfirm={handlePublishEvent}
        eventName={event.name}
      />
    </Box>
  );
};

export default SettingsPage;

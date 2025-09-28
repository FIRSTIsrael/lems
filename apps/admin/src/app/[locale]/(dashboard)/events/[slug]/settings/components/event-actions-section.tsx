"use client";

import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { useTranslations } from "next-intl";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import { EventSettings } from "@lems/types/api/admin";
import { apiFetch } from "@lems/shared";
import { useEvent } from "../../components/event-context";
import { CompleteEventDialog } from "./complete-event-dialog";
import { PublishEventDialog } from "./publish-event-dialog";

interface EventActionsSectionProps {
  settings: EventSettings;
  mutateSettings: KeyedMutator<EventSettings>;
  setAlert: (
    alert: { type: "success" | "error"; message: string } | null
  ) => void;
}

export const EventActionsSection: React.FC<EventActionsSectionProps> = ({
  settings,
  mutateSettings,
  setAlert,
}) => {
  const t = useTranslations("pages.events.settings");
  const event = useEvent();

  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  const handleCompleteEvent = async () => {
    setAlert(null);
    try {
      const response = await apiFetch(
        `/admin/events/${event.id}/settings/complete`,
        { method: "POST" }
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
        { method: "POST" }
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

  return (
    <>
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
    </>
  );
};

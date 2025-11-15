"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { Box, Stack, Alert, CircularProgress } from "@mui/material";
import { EventSettings } from "@lems/types/api/admin";
import { EventPageTitle } from "../components/event-page-title";
import { useEvent } from "../components/event-context";
import { EventSettingsSection } from "./components/event-settings-section";
import { EventActionsSection } from "./components/event-actions-section";
import { DangerZoneSection } from "./components/danger-zone-section";

const SettingsPage: React.FC = () => {
  const t = useTranslations("pages.events.settings");
  const event = useEvent();

  const {
    data: settings,
    mutate: mutateSettings,
    error,
  } = useSWR<EventSettings>(`/admin/events/${event.id}/settings`, {
    suspense: false,
  });

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
        <EventSettingsSection
          settings={settings}
          mutateSettings={mutateSettings}
          setAlert={setAlert}
        />

        <EventActionsSection
          settings={settings}
          mutateSettings={mutateSettings}
          setAlert={setAlert}
        />

        <DangerZoneSection />
      </Stack>
    </Box>
  );
};

export default SettingsPage;

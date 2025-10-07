"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  useTheme,
} from "@mui/material";

export const DangerZoneSection = () => {
  const t = useTranslations("pages.events.settings.danger-zone");
  const theme = useTheme();

  return (
    <Card sx={{ border: `2px solid ${theme.palette.error.main}` }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="error">
          {t("title")}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              color="error"
              disabled={true}
              sx={{ minWidth: 160 }}
            >
              {t("delete-event")}
            </Button>
            <Box>
              <Typography variant="body2">
                {t("delete-event-description")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("delete-disabled")}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

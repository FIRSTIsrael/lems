'use client';

import React, { useState } from 'react';
import { KeyedMutator } from 'swr';
import { useLocale, useTranslations } from 'next-intl';
import { Box, Card, CardContent, Typography, Button, Divider, Stack } from '@mui/material';
import { EventSettings } from '@lems/types/api/admin';
import { apiFetch, connectSseStream, getApiBase } from '@lems/shared';
import { useEvent } from '../../components/event-context';
import { CompleteEventDialog } from './complete-event-dialog';
import { PublishEventDialog } from './publish-event-dialog';
import { DownloadResultsDialog } from './download-results-dialog';

interface EventActionsSectionProps {
  settings: EventSettings;
  mutateSettings: KeyedMutator<EventSettings>;
  setAlert: (alert: { type: 'success' | 'error'; message: string } | null) => void;
}

export const EventActionsSection: React.FC<EventActionsSectionProps> = ({
  settings,
  mutateSettings,
  setAlert
}) => {
  const t = useTranslations('pages.events.settings');
  const event = useEvent();
  const locale = useLocale();

  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

  const handleCompleteEvent = async () => {
    setAlert(null);
    try {
      const response = await apiFetch(`/admin/events/${event.id}/settings/complete`, {
        method: 'POST'
      });

      if (response.ok) {
        await mutateSettings();
        setAlert({ type: 'success', message: t('messages.complete-success') });
        setCompleteDialogOpen(false);
      } else {
        setAlert({ type: 'error', message: t('messages.complete-error') });
      }
    } catch {
      setAlert({ type: 'error', message: t('messages.complete-error') });
    }
  };

  const handlePublishEvent = async (onProgress: (percent: number, message?: string) => void) => {
    setAlert(null);
    try {
      const result = await connectSseStream<{
        published: boolean;
        emailsSent: number;
        emailsFailed: number;
        failedEmails?: string[];
      }>(
        `/admin/events/${event.id}/settings/publish`,
        { method: 'POST' },
        {
          onStart: () => onProgress(0),
          onProgress: (percent, message) => onProgress(percent, message)
        }
      );

      if (result?.published) {
        await mutateSettings();
        const successMsg =
          result.emailsSent > 0
            ? t('messages.publish-success-with-emails', {
                emailsSent: result.emailsSent,
                emailsFailed: result.emailsFailed
              })
            : t('messages.publish-success');
        setAlert({ type: 'success', message: successMsg });
        setPublishDialogOpen(false);
      } else {
        setAlert({ type: 'error', message: t('messages.publish-error') });
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : t('messages.publish-error');
      setAlert({ type: 'error', message: errorMsg });
    }
  };

  const handleDownloadResults = async (onProgress: (percent: number) => void) => {
    setAlert(null);
    try {
      const result = await connectSseStream<{ token: string }>(
        `/admin/events/${event.id}/settings/download?language=${locale}`,
        { method: 'POST' },
        {
          onStart: () => onProgress(0),
          onProgress
        }
      );

      if (!result?.token) {
        setAlert({ type: 'error', message: t('messages.download-error') });
        return;
      }

      const a = document.createElement('a');
      a.href = `${getApiBase(true)}/admin/events/${event.id}/settings/download/file?token=${result.token}`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setAlert({ type: 'success', message: t('messages.download-success') });
      setDownloadDialogOpen(false);
    } catch {
      setAlert({ type: 'error', message: t('messages.download-error') });
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('event-actions.title')}
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
                  {t('event-actions.complete-event')}
                </Button>
                <Box>
                  <Typography variant="body2">
                    {t('event-actions.complete-event-description')}
                  </Typography>
                  {settings.completed && (
                    <Typography variant="caption" color="text.secondary">
                      {t('event-actions.already-completed')}
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
                  {t('event-actions.publish-event')}
                </Button>
                <Box>
                  <Typography variant="body2">
                    {t('event-actions.publish-event-description')}
                  </Typography>
                  {settings.published && (
                    <Typography variant="caption" color="text.secondary">
                      {t('event-actions.already-published')}
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
                  disabled={!settings.published}
                  onClick={() => setDownloadDialogOpen(true)}
                  sx={{ minWidth: 160 }}
                >
                  {t('event-actions.download-results')}
                </Button>
                <Box>
                  <Typography variant="body2">
                    {t('event-actions.download-results-description')}
                  </Typography>
                  {!settings.published && (
                    <Typography variant="caption" color="text.secondary">
                      {t('event-actions.not-published')}
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

      <DownloadResultsDialog
        open={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
        onConfirm={handleDownloadResults}
        eventName={event.name}
      />
    </>
  );
};

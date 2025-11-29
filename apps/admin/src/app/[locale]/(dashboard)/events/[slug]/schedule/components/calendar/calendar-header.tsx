'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { mutate } from 'swr';
import { Box, Stack, Button, CircularProgress } from '@mui/material';
import { Add, CheckCircle, Error as ErrorIcon, Send } from '@mui/icons-material';
import { Division } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { useSchedule } from '../schedule-context';
import { useCalendar } from './calendar-context';
import { NotificationBanner } from './notification-banner';
import {
  NotificationState,
  prepareAgendaRequest,
  prepareSchedulerRequest,
  ValidateScheduleResponseSchema
} from './schedule-utils';

export const CalendarHeader: React.FC<{ division: Division }> = ({ division }) => {
  const t = useTranslations('pages.events.schedule.calendar');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    variant: null,
    message: '',
    show: false
  });
  const [verificationPassed, setVerificationPassed] = useState(false);
  const [isSavingAgenda, setIsSavingAgenda] = useState(false);

  const { addPracticeRound, addRankingRound } = useCalendar();
  const calendarContext = useCalendar();
  const scheduleContext = useSchedule();

  const handleVerify = async () => {
    setIsVerifying(true);
    setNotification({ variant: null, message: '', show: false });

    try {
      const requestData = prepareSchedulerRequest(calendarContext, scheduleContext, division.id);

      const result = await apiFetch(
        `/admin/events/${division.eventId}/divisions/${division.id}/schedule/validate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        },
        ValidateScheduleResponseSchema
      );

      if (!result.ok) {
        setNotification({
          variant: 'error',
          message: t('verify.error', { error: (result.error as { error: string }).error }),
          show: true
        });
        setVerificationPassed(false);
      } else if (result.data.is_valid) {
        setNotification({
          variant: 'success',
          message: t('verify.success'),
          show: true
        });
        setVerificationPassed(true);
      }
    } catch (error: unknown) {
      setNotification({
        variant: 'error',
        message: t('verify.error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        }),
        show: true
      });
      setVerificationPassed(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    setNotification({ variant: null, message: '', show: false });

    try {
      const requestData = prepareSchedulerRequest(calendarContext, scheduleContext, division.id);

      const response = await apiFetch(
        `/admin/events/${division.eventId}/divisions/${division.id}/schedule/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      setNotification({ variant: 'success', message: t('generate.success'), show: true });
      mutate(`/admin/events/${division.eventId}/divisions`);
    } catch (error: unknown) {
      setNotification({
        variant: 'error',
        message: t('generate.error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        }),
        show: true
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAgenda = async () => {
    setIsSavingAgenda(true);
    setNotification({ variant: null, message: '', show: false });
    try {
      const requestData = prepareAgendaRequest(calendarContext, scheduleContext, division.id);

      const response = await apiFetch(
        `/admin/events/${division.eventId}/divisions/${division.id}/schedule/agenda-events`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        }
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      setNotification({ variant: 'success', message: t('agenda.generate.success'), show: true });
      mutate(`/admin/events/${division.eventId}/divisions`);
    } catch (error: unknown) {
      setNotification({
        variant: 'error',
        message: t('agenda.generate.error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        }),
        show: true
      });
    } finally {
      setIsSavingAgenda(false);
    }
  };

  const getIcon = () => {
    if (isVerifying) return <CircularProgress size={20} />;
    if (!notification.show) return <CheckCircle />;

    switch (notification.variant) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <CheckCircle />;
    }
  };

  const getGenerateIcon = () => {
    if (isGenerating) return <CircularProgress size={20} />;
    return <Send />;
  };

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button size="small" variant="outlined" startIcon={<Add />} onClick={addPracticeRound}>
          {t('field.add-practice-round')}
        </Button>

        <Button size="small" variant="outlined" startIcon={<Add />} onClick={addRankingRound}>
          {t('field.add-ranking-round')}
        </Button>

        <Button
          size="small"
          variant="contained"
          startIcon={getIcon()}
          onClick={handleVerify}
          disabled={isVerifying}
          color={notification.variant === 'success' ? 'success' : 'primary'}
        >
          {isVerifying ? t('verify.verifying') : t('verify.title')}
        </Button>

        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={getGenerateIcon()}
          onClick={handleSubmit}
          disabled={!verificationPassed || isGenerating}
        >
          {isGenerating ? t('generate.generating') : t('generate.generate-button')}
        </Button>

        <Button
          size="small"
          variant="contained"
          startIcon={getGenerateIcon()}
          onClick={handleSaveAgenda}
          disabled={isSavingAgenda}
          color={notification.variant === 'success' ? 'success' : 'primary'}
        >
          {isSavingAgenda ? t('agenda.generating') : t('agenda.generate-button')}
        </Button>
      </Stack>

      <NotificationBanner
        variant={notification.variant}
        message={notification.message}
        show={notification.show}
      />
    </Box>
  );
};

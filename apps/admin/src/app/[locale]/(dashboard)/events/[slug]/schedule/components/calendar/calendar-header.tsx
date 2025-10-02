'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { mutate } from 'swr';
import { Box, Stack, Button, CircularProgress } from '@mui/material';
import { Add, CheckCircle, Error as ErrorIcon, Send } from '@mui/icons-material';
import { Division } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { useSchedule, ScheduleContextType } from '../schedule-context';
import { useCalendar, CalendarContextType } from './calendar-context';
import { getDuration } from './calendar-utils';
import { NotificationBanner } from './notification-banner';

const ValidatorDataSchema = z.object({
  overlapping_rounds: z.array(
    z.object({
      start_time: z.string(),
      end_time: z.string(),
      number: z.number(),
      stage: z.enum(['practice', 'ranking']),
      available_matches: z.array(
        z.object({
          event_type: z.enum(['judging', 'match']),
          stage: z.enum(['practice', 'ranking']),
          start_time: z.string(),
          end_time: z.string(),
          number: z.number(),
          round: z.number(),
          slots: z.number()
        })
      )
    })
  ),
  session: z.object({
    event_type: z.enum(['judging', 'match']),
    start_time: z.string(),
    end_time: z.string(),
    number: z.number(),
    slots: z.number()
  })
});

const ValidateScheduleResponseSchema = z.object({
  is_valid: z.boolean(),
  data: z.array(ValidatorDataSchema).optional(),
  error: z.nullable(z.string())
});

interface NotificationState {
  variant: 'success' | 'error' | null;
  message: string;
  show: boolean;
}

interface ScheduleBreak {
  event_type: 'judging' | 'match';
  after: number;
  duration_seconds: number;
}

interface SchedulerRequest {
  division_id: string;
  matches_start: string;
  practice_rounds: number;
  ranking_rounds: number;
  match_length_seconds: number;
  practice_match_cycle_time_seconds: number;
  ranking_match_cycle_time_seconds: number;
  stagger_matches: boolean;
  judging_start: string;
  judging_session_length_seconds: number;
  judging_cycle_time_seconds: number;
  breaks: Array<ScheduleBreak>;
  timezone: string;
}

function calculateBreaks(
  calendarContext: CalendarContextType,
  scheduleContext: ScheduleContextType
): Array<{
  event_type: 'judging' | 'match';
  after: number;
  duration_seconds: number;
}> {
  const breaks: Array<ScheduleBreak> = [];

  let matchCount = 0;
  const fieldBlocks = calendarContext.blocks.field;
  for (let i = 0; i < fieldBlocks.length - 1; i++) {
    const currentBlock = fieldBlocks[i];
    const nextBlock = fieldBlocks[i + 1];

    matchCount += scheduleContext.matchesPerRound;

    const currentEndTime = currentBlock.startTime.add(currentBlock.durationSeconds, 'seconds');
    const gapDuration = nextBlock.startTime.diff(currentEndTime, 'seconds');

    breaks.push({
      event_type: 'match',
      after: matchCount,
      duration_seconds: gapDuration
    });
  }

  let sessionCount = 0;
  const judgingBlocks = calendarContext.blocks.judging;
  for (let i = 0; i < judgingBlocks.length - 1; i++) {
    const currentBlock = judgingBlocks[i];
    const nextBlock = judgingBlocks[i + 1];

    sessionCount += 1;

    const currentEndTime = currentBlock.startTime.add(currentBlock.durationSeconds, 'seconds');
    const gapDuration = nextBlock.startTime.diff(currentEndTime, 'seconds');

    breaks.push({
      event_type: 'judging',
      after: sessionCount,
      duration_seconds: gapDuration
    });
  }

  return breaks;
}

export function prepareSchedulerRequest(
  calendarContext: CalendarContextType,
  scheduleContext: ScheduleContextType,
  divisionId: string
): SchedulerRequest {
  const fieldStartInTz = scheduleContext.fieldStart.tz(scheduleContext.timezone);
  const judgingStartInTz = scheduleContext.judgingStart.tz(scheduleContext.timezone);

  return {
    division_id: divisionId,
    matches_start: fieldStartInTz.toISOString(),
    practice_rounds: scheduleContext.practiceRounds,
    ranking_rounds: scheduleContext.rankingRounds,
    match_length_seconds: getDuration(scheduleContext.matchLength),
    practice_match_cycle_time_seconds: getDuration(scheduleContext.practiceCycleTime),
    ranking_match_cycle_time_seconds: getDuration(scheduleContext.rankingCycleTime),
    stagger_matches: scheduleContext.staggerMatches,
    judging_start: judgingStartInTz.toISOString(),
    judging_session_length_seconds: getDuration(scheduleContext.judgingSessionLength),
    judging_cycle_time_seconds: getDuration(scheduleContext.judgingSessionCycleTime),
    breaks: calculateBreaks(calendarContext, scheduleContext),
    timezone: scheduleContext.timezone
  };
}

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
      </Stack>

      <NotificationBanner
        variant={notification.variant}
        message={notification.message}
        show={notification.show}
      />
    </Box>
  );
};

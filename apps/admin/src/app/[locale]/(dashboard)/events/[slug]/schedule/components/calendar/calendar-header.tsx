'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Box, Stack, Button, Alert, CircularProgress, Collapse } from '@mui/material';
import { Add, CheckCircle, Warning, Error as ErrorIcon } from '@mui/icons-material';
import { Division } from '@lems/types/api/admin';
import { apiFetch } from '../../../../../../../../lib/fetch';
import { useSchedule, ScheduleContextType } from '../schedule-context';
import { useCalendar, CalendarContextType } from './calendar-context';
import { getDuration } from './calendar-utils';

const ValidatorDataSchema = z.object({
  type: z.string(),
  message: z.string(),
  severity: z.enum(['error', 'warning', 'info'])
});

const ValidateScheduleResponseSchema = z.object({
  is_valid: z.boolean(),
  data: z.array(ValidatorDataSchema).optional(),
  error: z.string().optional()
});

type ValidatorData = z.infer<typeof ValidatorDataSchema>;

interface VerificationResult {
  isValid: boolean;
  message: string;
  severity: 'success' | 'warning' | 'error';
  details?: ValidatorData[];
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
  breaks: Array<{
    event_type: 'judging' | 'match';
    after: number;
    duration_seconds: number;
  }>;
}

function calculateBreaks(calendarContext: CalendarContextType, scheduleContext: ScheduleContextType): Array<{
  event_type: 'judging' | 'match';
  after: number;
  duration_seconds: number;
}> {
  const breaks: Array<{
    event_type: 'judging' | 'match';
    after: number;
    duration_seconds: number;
  }> = [];

  const fieldBlocks = calendarContext.blocks.field.sort((a, b) => 
    a.startTime.valueOf() - b.startTime.valueOf()
  );

  let matchCount = 0;
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

  const judgingBlocks = calendarContext.blocks.judging.sort((a, b) => 
    a.startTime.valueOf() - b.startTime.valueOf()
  );

  let sessionCount = 0;
  for (let i = 0; i < judgingBlocks.length - 1; i++) {
    const currentBlock = judgingBlocks[i];
    const nextBlock = judgingBlocks[i + 1];
    
    sessionCount += 1;
    
    const currentEndTime = currentBlock.startTime.add(currentBlock.durationSeconds, 'seconds');
    const gapDuration = nextBlock.startTime.diff(currentEndTime, 'seconds');
    
    if (gapDuration > 300) {
      breaks.push({
        event_type: 'judging',
        after: sessionCount,
        duration_seconds: gapDuration
      });
    }
  }

  return breaks;
}

export function prepareSchedulerRequest(
  calendarContext: CalendarContextType,
  scheduleContext: ScheduleContextType,
  divisionId: string
): SchedulerRequest {
  return {
    division_id: divisionId,
    matches_start: scheduleContext.fieldStart.toISOString(),
    practice_rounds: scheduleContext.practiceRounds,
    ranking_rounds: scheduleContext.rankingRounds,
    match_length_seconds: getDuration(scheduleContext.matchLength),
    practice_match_cycle_time_seconds: getDuration(scheduleContext.practiceCycleTime),
    ranking_match_cycle_time_seconds: getDuration(scheduleContext.rankingCycleTime),
    stagger_matches: scheduleContext.staggerMatches,
    judging_start: scheduleContext.judgingStart.toISOString(),
    judging_session_length_seconds: getDuration(scheduleContext.judgingSessionLength),
    judging_cycle_time_seconds: getDuration(scheduleContext.judgingSessionCycleTime),
    breaks: calculateBreaks(calendarContext, scheduleContext)
  };
}

export const CalendarHeader: React.FC<{ division: Division }> = ({ division }) => {
  const t = useTranslations('pages.events.schedule.calendar');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const { addPracticeRound, addRankingRound } = useCalendar();
  const calendarContext = useCalendar();
  const scheduleContext = useSchedule();

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationResult(null);

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
        setVerificationResult({
          isValid: false,
          message: `Verification failed: ${result.error.error || 'Unknown error'}`,
          severity: 'error'
        });
        return;
      }
      
      const data = result.data;

      if (data.error) {
        setVerificationResult({
          isValid: false,
          message: `Verification failed: ${data.error}`,
          severity: 'error'
        });
      } else if (data.is_valid) {
        setVerificationResult({
          isValid: true,
          message: 'Schedule is valid! No conflicts detected.',
          severity: 'success'
        });
      } else {
        const errorCount =
          data.data?.filter((d: ValidatorData) => d.severity === 'error').length || 0;
        const warningCount =
          data.data?.filter((d: ValidatorData) => d.severity === 'warning').length || 0;

        setVerificationResult({
          isValid: false,
          message: `Schedule has issues: ${errorCount} error(s), ${warningCount} warning(s)`,
          severity: errorCount > 0 ? 'error' : 'warning',
          details: data.data
        });
      }
    } catch (error: unknown) {
      setVerificationResult({
        isValid: false,
        message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getIcon = () => {
    if (isVerifying) return <CircularProgress size={20} />;
    if (!verificationResult) return <CheckCircle />;

    switch (verificationResult.severity) {
      case 'success':
        return <CheckCircle />;
      case 'warning':
        return <Warning />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <CheckCircle />;
    }
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

        <Box sx={{ ml: 'auto' }} />

        <Button
          size="small"
          variant="contained"
          startIcon={getIcon()}
          onClick={handleVerify}
          disabled={isVerifying}
          color={verificationResult?.severity === 'success' ? 'success' : 'primary'}
        >
          {isVerifying ? 'Verifying...' : 'Verify Schedule'}
        </Button>
      </Stack>

      <Collapse in={!!verificationResult} sx={{ mt: 2 }}>
        {verificationResult && (
          <Box>
            <Alert severity={verificationResult.severity} sx={{ mb: 1 }}>
              {verificationResult.message}
            </Alert>

            {verificationResult.details && verificationResult.details.length > 0 && (
              <Box sx={{ pl: 2 }}>
                {verificationResult.details.map((detail, index) => (
                  <Alert
                    key={index}
                    severity={detail.severity === 'info' ? 'info' : detail.severity}
                    sx={{ mb: 0.5, fontSize: '0.875rem' }}
                  >
                    <strong>{detail.type}:</strong> {detail.message}
                  </Alert>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

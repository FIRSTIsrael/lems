import { z } from 'zod';
import { ScheduleContextType } from '../schedule-context';
import { CalendarContextType } from './calendar-context';
import { getDuration } from './calendar-utils';
import { InsertableAgendaEvent } from '@lems/database';
import { AgendaBlock } from './calendar-types';
import { Create } from '@mui/icons-material';

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

export const ValidateScheduleResponseSchema = z.object({
  is_valid: z.boolean(),
  data: z.array(ValidatorDataSchema).optional(),
  error: z.nullable(z.string())
});

export interface NotificationState {
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

interface Agenda {
  division_id: string;
  title: string;
  visibility: string;
  start_time: string;
  duration: number;
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
  const fieldStartInTz = scheduleContext.fieldStart.tz(scheduleContext.timezone, true);
  const judgingStartInTz = scheduleContext.judgingStart.tz(scheduleContext.timezone, true);

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

export function prepareAgendaRequest(
  calendarContext: CalendarContextType,
  scheduleContext: ScheduleContextType,
  divisionId: string
): Agenda[] {
  const agendaEvents: Agenda[] = [];

  const agendaBlocks = calendarContext.blocks.agenda;
  
  for (let i = 0; i < agendaBlocks.length; i++) {
    const block = (agendaBlocks[i] as AgendaBlock);
    const startTimeInTz = block.startTime.tz(scheduleContext.timezone, true);

    agendaEvents.push({
      title: block.title,
      visibility: block.visibilty,
      start_time: startTimeInTz.toISOString(),
      duration: block.durationSeconds,
      division_id: divisionId
    });
  }

  return agendaEvents;
}
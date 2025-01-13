export interface ScheduleGenerationSettings {
  practiceRounds: number;
  rankingRounds: number;
  isStaggered: boolean;
  matchesStart: Date | null;
  judgingStart: Date | null;
  practiceCycleTimeSeconds: number | null;
  rankingCycleTimeSeconds: number | null;
  judgingCycleTimeSeconds: number | null;
  breaks: ScheduleBreak[];
}

export interface ScheduleBreak {
  eventType: 'match' | 'judging';
  after: number;
  durationSeconds: number;
}

export interface SchedulerRequest {
  division_id: string;

  matches_start: Date;
  practice_rounds: number;
  ranking_rounds: number;
  match_length_seconds: number;
  practice_match_cycle_time_seconds: number;
  ranking_match_cycle_time_seconds: number;
  stagger_matches: boolean;

  judging_start: Date;
  judging_session_length_seconds: number;
  judging_cycle_time_seconds: number;

  breaks: SchedulerRequestBreaks[];
}

export interface SchedulerRequestBreaks {
  event_type: 'match' | 'judging';
  after: number;
  duration_seconds: number;
}

import type { Edition } from '../edition';

export type JudgingStageDefinition = { id: string; duration: number | 'remainder' };

const FOUNDERS_STAGES: JudgingStageDefinition[] = [
  { id: 'setup', duration: 120 }, // 2 min - Welcome
  { id: 'innovation-presentation', duration: 300 }, // 5 min
  { id: 'innovation-questions', duration: 300 }, // 5 min
  { id: 'robot-presentation', duration: 300 }, // 5 min
  { id: 'robot-questions', duration: 300 }, // 5 min
  { id: 'final-thoughts', duration: 'remainder' }
];

// Ids are reused from Founders where the stage has the same role; labels differ via `future.<id>` keys.
const FUTURE_STAGES: JudgingStageDefinition[] = [
  { id: 'setup', duration: 120 }, // 2 min - Welcome
  { id: 'innovation-presentation', duration: 300 }, // 5 min - Project Presentation
  { id: 'innovation-questions', duration: 180 }, // 3 min - Project Q&A
  { id: 'robot-presentation', duration: 300 }, // 5 min - Engineering Design Presentation
  { id: 'robot-questions', duration: 180 }, // 3 min - Engineering Design Q&A
  { id: 'core-values-questions', duration: 180 }, // 3 min - Core Values Q&A
  { id: 'judging-feedback', duration: 'remainder' } // 3 min at the default 24-min session
];

/** Default judging session length and cycle time used to pre-fill the admin schedule form. */
export const JUDGING_DEFAULTS: Record<
  Edition,
  { sessionLengthSeconds: number; cycleTimeSeconds: number }
> = {
  founders: { sessionLengthSeconds: 30 * 60, cycleTimeSeconds: 45 * 60 },
  future: { sessionLengthSeconds: 24 * 60, cycleTimeSeconds: 30 * 60 }
};

export const getJudgingStages = (edition: Edition): JudgingStageDefinition[] => {
  switch (edition) {
    case 'future':
      return FUTURE_STAGES;
    case 'founders':
      return FOUNDERS_STAGES;
  }
};

const sumFixedDurations = (stages: JudgingStageDefinition[]) =>
  stages.reduce((sum, s) => sum + (s.duration === 'remainder' ? 0 : s.duration), 0);

/** The shortest judging session (in seconds) that fits every fixed stage of the edition. */
export const getMinimumJudgingSessionLength = (edition: Edition): number =>
  sumFixedDurations(getJudgingStages(edition));

/**
 * Replaces the single 'remainder' stage with sessionLength minus the fixed stages.
 * If the session is shorter than the fixed stages, the remainder is clamped to 0.
 * Callers that accept a session length should reject values below
 * getMinimumJudgingSessionLength.
 */
export const resolveJudgingStages = (
  stages: JudgingStageDefinition[],
  sessionLength: number
): { id: string; duration: number }[] => {
  const remainder = Math.max(0, sessionLength - sumFixedDurations(stages));
  return stages.map(s => ({
    id: s.id,
    duration: s.duration === 'remainder' ? remainder : s.duration
  }));
};

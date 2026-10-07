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

export const getJudgingStages = (edition: Edition): JudgingStageDefinition[] => {
  switch (edition) {
    case 'future':
      // TODO(future-edition): replace with Future content (phase 3)
      return FOUNDERS_STAGES;
    case 'founders':
      return FOUNDERS_STAGES;
  }
};

/** Replaces the single 'remainder' stage with sessionLength minus the fixed stages. */
export const resolveJudgingStages = (
  stages: JudgingStageDefinition[],
  sessionLength: number
): { id: string; duration: number }[] => {
  const fixed = stages.reduce((sum, s) => sum + (s.duration === 'remainder' ? 0 : s.duration), 0);
  return stages.map(s => ({
    id: s.id,
    duration: s.duration === 'remainder' ? sessionLength - fixed : s.duration
  }));
};

export type DivisionColor = 'red' | 'blue';

export type Status = 'not-started' | 'in-progress' | 'completed';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export type MissionClauseType = 'boolean' | 'enum' | 'number';

export const RobotGameMatchStages = ['practice', 'ranking', 'test'] as const;
export type RobotGameMatchStage = (typeof RobotGameMatchStages)[number];

export type RobotGameMatchStatus = 'not-started' | 'in-progress' | 'completed';

export type RobotGameMatchPresent = 'present' | 'no-show';

export const JudgingCategoryTypes = ['innovation-project', 'robot-design', 'core-values'] as const;
export type JudgingCategory = (typeof JudgingCategoryTypes)[number];

export const OptionalAwardsTypes = ['breakthrough', 'risingAllStar', 'motivate'] as const;
export type OptionalAwards = (typeof OptionalAwardsTypes)[number];

export const RubricStatusTypes = [
  'empty',
  'in-progress',
  'completed',
  'waiting-for-review',
  'ready'
] as const;
export type RubricStatus = (typeof RubricStatusTypes)[number];

export const TicketTypes = ['general', 'schedule', 'utilities', 'incident'] as const;
export type TicketType = (typeof TicketTypes)[number];

export const AudienceDisplayStateTypes = ['scores', 'awards', 'sponsors', 'logo', 'hotspot'];
export type AudienceDisplayState = (typeof AudienceDisplayStateTypes)[number];

export type RubricFields<T extends JudgingCategory> = T extends 'core-values'
  ? 'discovery' | 'innovation' | 'impact' | 'inclusion' | 'teamwork' | 'fun'
  : 'identify' | 'design' | 'create' | 'iterate' | 'communicate';

export type RubricInnerFieldPairs<T extends JudgingCategory> = T extends 'innovation-project'
  ?
      | ['problem', 'research']
      | ['selection', 'plan']
      | ['development', 'model']
      | ['sharing', 'improvements']
      | ['presentation', 'impact']
  :
      | ['strategy', 'skills']
      | ['plan', 'features']
      | ['functionality', 'code']
      | ['testing', 'improvements']
      | ['process', 'involvement'];

export type RubricInnerFields<T extends JudgingCategory> =
  | RubricInnerFieldPairs<T>[0]
  | RubricInnerFieldPairs<T>[1];

export const JUDGING_SESSION_LENGTH = 2 * 60;
export const MATCH_LENGTH = 2.5 * 60;
export const SEASON_NAME = 'MASTERPIECE℠';

// All these values will have no effect at V2.0
// Support will be added in future versions
export const ALLOW_MATCH_SELECTOR = false;
export const COUNTDOWN_BEFORE_MATCH = false;
export const ALLOW_UNREGULATED_START = false;
export const ALLOW_UNREGULATED_LOAD = true;

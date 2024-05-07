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

export const CoreValuesAwardsTypes = ['breakthrough', 'risingAllStar', 'motivate'] as const;
export type CoreValuesAwards = (typeof CoreValuesAwardsTypes)[number];

export const DivisionSectionTypes = ['field', 'judging'];
export type DivisionSection = (typeof DivisionSectionTypes)[number];

export const OptionalAwardTypes = [
  'leadMentor',
  'impact',
  'volunteerOfTheYear',
  'excellenceInEngineering',
  ...CoreValuesAwardsTypes
] as const;
export type OptionalAwards = (typeof CoreValuesAwardsTypes)[number];

export const MandatoryAwardTypes = [
  'coreValues',
  'innovationProject',
  'robotDesign',
  'robotPerformance',
  'champions'
] as const;
export type MandatoryAwards = (typeof MandatoryAwardTypes)[number];

export const AwardNameTypes = [...MandatoryAwardTypes, ...OptionalAwardTypes] as const;
export type AwardNames = (typeof AwardNameTypes)[number];

export type AwardSchema = { [key in AwardNames]: { index: number; count: number } };

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

export const AudienceDisplayScreenTypes = [
  'blank',
  'logo',
  'scores',
  'match-preview',
  'awards',
  'sponsors',
  'hotspot',
  'message'
];
export type AudienceDisplayScreen = (typeof AudienceDisplayScreenTypes)[number];

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

export const JUDGING_SESSION_LENGTH = 27 * 60;
export const MATCH_LENGTH = 2.5 * 60;
export const SEASON_NAME = 'MASTERPIECE℠';

export const MATCH_AUTOLOAD_THRESHOLD = 10;

// All these values will have no effect at V2.0
// Support will be added in future versions
export const ALLOW_MATCH_SELECTOR = false;
export const COUNTDOWN_BEFORE_MATCH = false;
export const ALLOW_UNREGULATED_START = false;
export const ALLOW_UNREGULATED_LOAD = true;

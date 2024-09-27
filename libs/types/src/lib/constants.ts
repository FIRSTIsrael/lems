export const DivisionSwatches = [
  '#DF1125',
  '#FC4E12',
  '#E8C511',
  '#80E220',
  '#1EA5FC',
  '#1E538F',
  '#5F41B2',
  '#F12E6D',
  '#7A6E49',
  '#578887'
];

export type Status = 'not-started' | 'in-progress' | 'completed';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export type MissionClauseType = 'boolean' | 'enum' | 'number';

export const RobotGameMatchStages = ['practice', 'ranking', 'test'] as const;
export type RobotGameMatchStage = (typeof RobotGameMatchStages)[number];

export type RobotGameMatchStatus = 'not-started' | 'in-progress' | 'completed';

export type RobotGameMatchPresent = 'present' | 'no-show';

export const JudgingCategoryTypes = ['innovation-project', 'robot-design', 'core-values'] as const;
export type JudgingCategory = (typeof JudgingCategoryTypes)[number];

export const CoreValuesAwardsTypes = ['breakthrough', 'rising-all-star', 'motivate'] as const;
export type CoreValuesAwards = (typeof CoreValuesAwardsTypes)[number];

export const DivisionSectionTypes = ['field', 'judging'];
export type DivisionSection = (typeof DivisionSectionTypes)[number];

export const PersonalAwardTypes = ['lead-mentor', 'volunteer-of-the-year'];

export const OptionalAwardTypes = [
  'impact',
  'excellence-in-engineering',
  ...PersonalAwardTypes,
  ...CoreValuesAwardsTypes
] as const;
export type OptionalAwards = (typeof OptionalAwardTypes)[number];

export const MandatoryAwardTypes = [
  'core-values',
  'innovation-project',
  'robot-design',
  'robot-performance',
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

export const JUDGING_SESSION_LENGTH = 27 * 60;
export const MATCH_LENGTH = 2.5 * 60;
export const CATEGORY_DELIBERATION_LENGTH = 20 * 60;
export const CHAMPIONS_DELIBERATION_STAGE_LENGTH = 5 * 60;
export const CORE_AWARDS_DELIBERATION_STAGE_LENGTH = 15 * 60;
export const OPTIONAL_AWARDS_DELIBERATION_STAGE_LENGTH = 10 * 60;
export const MANDATORY_AWARD_PICKLIST_LENGTH = 12;
export const SEASON_NAME = 'SUBMERGED℠';

export const MATCH_AUTOLOAD_THRESHOLD = 10;
export const ALLOW_UNREGULATED_START = false;
export const ALLOW_UNREGULATED_LOAD = true;

import { OptionalAwards } from '@lems/shared';
import { Division, JudgingCategory } from '@lems/database';
import { Room, MetricPerCategory } from '../types';

export type FinalDeliberationStage = 'champions' | 'core-awards' | 'optional-awards' | 'review';
export type StagesWithNomination = 'champions' | 'core-awards' | 'optional-awards';

export type OptionalAwardNominations = Partial<Record<OptionalAwards, boolean>>;
export type RanksPerCategory = Record<JudgingCategory | 'total', number>;
export type EligiblityPerStage = Record<StagesWithNomination, boolean>;
export type RubricFields = Record<string, number | null>;
export type RubricsFields = Record<JudgingCategory, RubricFields>;

/**
 * Enriched team data with all computed values for final deliberation.
 */
type EnrichedTeam = {
  id: string;
  number: string;
  name: string;
  arrived: boolean;
  disqualified: boolean;
  slug: string;
  room: Room | null;

  scores: MetricPerCategory;
  normalizedScores: MetricPerCategory;
  ranks: RanksPerCategory;

  eligibility: EligiblityPerStage;

  rubricsFields: RubricsFields;
  gpScores: Record<string, number | null>;

  rubricIds: Record<JudgingCategory, string | null>;

  robotGameScores: Record<string, number | null>;

  awardNominations: OptionalAwardNominations;
};

export interface FinalDeliberationContextValue {
  division: Division | null;
  deliberation: FinalJudgingDeliberation | null;

  teams: EnrichedTeam[];

  eligibleTeams: Record<StagesWithNomination, string[]>;
}

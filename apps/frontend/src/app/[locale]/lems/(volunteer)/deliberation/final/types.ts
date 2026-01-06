import { Award, OptionalAwards } from '@lems/shared';
import { Division, JudgingCategory } from '@lems/database';
import { Room, MetricPerCategory, RoomMetricsMap } from '../types';
import { FinalJudgingDeliberation } from './graphql';

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
export type EnrichedTeam = {
  id: string;
  number: string;
  name: string;
  arrived: boolean;
  disqualified: boolean;
  slug: string;
  room: Room | null;

  scores: MetricPerCategory;
  normalizedScores: Omit<MetricPerCategory, 'core-values-no-gp'>;
  ranks: RanksPerCategory;

  eligibility: EligiblityPerStage;

  rubricsFields: RubricsFields;
  gpScores: Record<string, number | null>;

  rubricIds: Record<JudgingCategory, string | null>;

  robotGameScores: Record<string, number | null>;

  awardNominations: OptionalAwardNominations;
};

export interface FinalDeliberationContextValue {
  division: Division;
  deliberation: FinalJudgingDeliberation;

  teams: EnrichedTeam[];

  eligibleTeams: Record<StagesWithNomination, string[]>;
  availableTeams: string[];

  categoryPicklists: Record<JudgingCategory, string[]>;

  awards: Record<Award, string[]>;

  roomMetrics: RoomMetricsMap;

  startDeliberation(): Promise<void>;
  updateAward(teamId: string, awardId: Award, place: number): Promise<void>;
  adavanceStage(): Promise<void>;
}

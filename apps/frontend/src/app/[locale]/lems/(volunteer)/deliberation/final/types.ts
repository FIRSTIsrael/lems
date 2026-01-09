import { Award, OptionalAwards } from '@lems/shared';
import { JudgingCategory } from '@lems/database';
import { Room, MetricPerCategory, RoomMetricsMap } from '../types';
import { Division, FinalJudgingDeliberation } from './graphql';

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

export type DeliberationAwards = Partial<Record<Award, string[]>> & {
  champions: Record<number, string>;
};

export interface FinalDeliberationContextValue {
  division: Division;
  deliberation: FinalJudgingDeliberation;

  teams: EnrichedTeam[];

  eligibleTeams: Record<StagesWithNomination, string[]>;
  availableTeams: string[];

  categoryPicklists: Record<JudgingCategory, string[]>;

  awards: DeliberationAwards;

  roomMetrics: RoomMetricsMap;

  startDeliberation(): Promise<void>;
  updateAward(awardName: Award, updatedAward: string[] | Record<number, string>): Promise<void>;
  advanceStage(): Promise<void>;
  updateManualEligibility(stage: StagesWithNomination, teamIds: string[]): Promise<void>;
}

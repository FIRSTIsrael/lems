import type { MetricPerCategory, Room, RoomMetricsMap } from '../types';
import type { Division, JudgingDeliberation } from './graphql/types';

/**
 * Enriched team data with all computed values for deliberation.
 */
export interface EnrichedTeam {
  id: string;
  number: string;
  name: string;
  arrived: boolean;
  disqualified: boolean;
  slug: string;
  room: Room | null;

  scores: MetricPerCategory;
  normalizedScores: MetricPerCategory;
  rank: number;

  eligible: boolean;

  rubricFields: Record<string, number | null>;
  gpScores: Record<string, number | null>;

  rubricId: string | null;

  awardNominations: Record<string, boolean>;
}

export interface DeliberationContextValue {
  division: Division | null;
  deliberation: JudgingDeliberation | null;

  teams: EnrichedTeam[];

  eligibleTeams: string[];
  availableTeams: string[];
  picklistTeams: EnrichedTeam[];
  suggestedTeam: EnrichedTeam | null;

  picklistLimit: number;
  fieldDisplayLabels: string[];

  roomMetrics: RoomMetricsMap;

  startDeliberation(): Promise<void>;
  updatePicklist(teamIds: string[]): Promise<void>;
  addToPicklist(teamId: string): Promise<void>;
  removeFromPicklist(teamId: string): Promise<void>;
  reorderPicklist(sourceIndex: number, destIndex: number): Promise<void>;
}

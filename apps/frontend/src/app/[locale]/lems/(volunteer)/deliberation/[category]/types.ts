import { JudgingCategory } from '@lems/types/judging';
import type { Division, JudgingDeliberation, Room } from './graphql/types';

export type MetricPerCategory = Record<JudgingCategory | 'total', number>;

/**
 * Metrics aggregated across all teams in a room.
 * Used to compute normalization factors.
 */
export interface RoomMetrics {
  avgScores: MetricPerCategory;
  teamCount: number;
}

/**
 * Aggregated room metrics indexed by room ID.
 */
export type RoomMetricsMap = Record<string, RoomMetrics>;

/**
 * Metadata for a single rubric field in a category.
 */
export interface FieldMetadata {
  id: string;
  category: 'innovation-project' | 'robot-design' | 'core-values';
  sectionId: string;
  fieldNumber: number;
  displayLabel: string; // e.g., 'IP-1', 'RD-5'
  coreValues: boolean;
}

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
  ranks: MetricPerCategory;

  eligible: boolean;

  rubricFields: Record<string, number | null>;
  gpScores: Record<string, number | null>;

  rubricIds: {
    'innovation-project': string | null;
    'robot-design': string | null;
    'core-values': string | null;
  };

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

  startDeliberation(): Promise<void>;
  updatePicklist(teamIds: string[]): Promise<void>;
  addToPicklist(teamId: string): Promise<void>;
  removeFromPicklist(teamId: string): Promise<void>;
  reorderPicklist(sourceIndex: number, destIndex: number): Promise<void>;
}

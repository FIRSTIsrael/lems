import { RobotGameMatch, RobotGameMatchStage } from '@lems/database';

export type RobotGameMatchStatus = 'not-started' | 'in-progress' | 'completed';

export interface MatchParticipant {
  id: string;
  matchId: string;
  team: {
    id: string;
    name: string;
    number: string;
    affiliation: string;
    city: string;
    region: string;
    logoUrl: string | null;
    arrived: boolean;
    slug: string;
  } | null;
  table: {
    id: string;
    name: string;
  };
  queued: boolean;
  present: boolean;
  ready: boolean;
  scoresheet: {
    id: string;
    slug: string;
    status: string;
    escalated: boolean;
  } | null;
}

export interface RefereeMatch extends Omit<RobotGameMatch, 'stage'> {
  slug: string;
  status: RobotGameMatchStatus;
  startTime: string | null;
  scheduledTime: string;
  stage: RobotGameMatchStage;
  participants: MatchParticipant[];
}

export interface RefereeFieldData {
  divisionId: string;
  matches: RefereeMatch[];
  audienceDisplay: {
    activeDisplay: string;
    settings: Record<string, unknown>;
  };
  currentStage: RobotGameMatchStage;
  loadedMatch: string | null;
  activeMatch: string | null;
  matchLength: number;
  tableId: string;
}

export interface RefereeData {
  division: {
    id: string;
    tables: { id: string; name: string }[];
    field: RefereeFieldData;
  };
}

export interface RefereeVars {
  divisionId: string;
  tableId: string;
}

// Subscription event types
export interface MatchEvent {
  matchId: string;
  startTime?: string;
  startDelta?: number;
}

export interface TeamArrivedEvent {
  teamId: string;
  matchId: string;
  arrived: boolean;
}

export interface MatchCompletedEvent {
  matchId: string;
  status: RobotGameMatchStatus;
  completedAt: string;
}

export interface MatchLoadedEvent {
  matchId: string;
  loadedAt: string;
}

export interface MatchAbortedEvent {
  matchId: string;
}

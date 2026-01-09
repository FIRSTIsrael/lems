export interface HeadRefereeData {
  division: {
    id: string;
    field: {
      divisionId: string;
      loadedMatch: string | null;
      matches: Match[];
      scoresheets: Scoresheet[];
      tables: Table[];
    };
  };
}

export interface HeadRefereeVars {
  divisionId: string;
}

export interface Match {
  id: string;
  slug: string;
  stage: 'PRACTICE' | 'RANKING';
  round: number;
  number: number;
  scheduledTime: string;
  startTime?: string;
  status: string;
  participants: MatchParticipant[];
}

export interface MatchParticipant {
  id: string;
  team: TeamInfo | null;
  table: Table;
  queued: boolean;
  present: boolean;
  ready: boolean;
}

export interface TeamInfo {
  id: string;
  number: string;
  name: string;
  slug: string;
  arrived: boolean;
}

export interface Table {
  id: string;
  name: string;
}

export interface Scoresheet {
  id: string;
  slug: string;
  stage: 'PRACTICE' | 'RANKING';
  round: number;
  status: ScoresheetStatus;
  escalated: boolean;
  team: {
    id: string;
    number: string;
    name: string;
    slug: string;
  };
  data: ScoresheetData | null;
}

export interface ScoresheetData {
  score: number;
  gp: {
    value: 2 | 3 | 4 | null;
  } | null;
}

export type ScoresheetStatus = 'empty' | 'draft' | 'completed' | 'gp' | 'submitted';

export interface FieldData {
  divisionId: string;
  loadedMatch: string | null;
  matches: Match[];
  scoresheets: Scoresheet[];
  tables: Table[];
  matchLength?: number;
}

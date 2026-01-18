import { ScoresheetClauseValue } from '@lems/shared/scoresheet';

export interface ScoresheetData {
  missions: Record<string, Record<number, ScoresheetClauseValue>>;
  signature?: string;
  gp: {
    value: number | null;
    notes?: string;
  };
  score: number;
}

export interface ScoresheetItem {
  id: string;
  team: {
    id: string;
  };
  divisionId: string;
  slug: string;
  stage: string;
  round: number;
  status: string;
  escalated?: boolean;
  data: ScoresheetData;
  allTeamScoresheets?: Array<{
    id: string;
    slug: string;
    stage: string;
    round: number;
    status: string;
    escalated?: boolean;
  }>;
}

export type QueryResult = {
  division: {
    id: string;
    field: {
      scoresheets: ScoresheetItem[];
      allTeamScoresheets: Array<{
        id: string;
        slug: string;
        stage: string;
        round: number;
        status: string;
        escalated?: boolean;
      }>;
    };
  };
};

export type QueryVariables = {
  divisionId: string;
  teamId: string;
  slug: string;
};

export type SubscriptionVariables = {
  divisionId: string;
};

export type ScoresheetMissionClauseUpdatedEvent = {
  __typename: 'ScoresheetMissionClauseUpdated';
  scoresheetId: string;
  missionId: string;
  clauseIndex: number;
  clauseValue: ScoresheetClauseValue;
  score: number;
};

export type ScoresheetStatusUpdatedEvent = {
  __typename: 'ScoresheetStatusUpdated';
  scoresheetId: string;
  status: string;
};

export type ScoresheetGPUpdatedEvent = {
  __typename: 'ScoresheetGPUpdated';
  scoresheetId: string;
  gpValue: number | null;
  notes?: string;
};

export type ScoresheetEscalatedUpdatedEvent = {
  __typename: 'ScoresheetEscalatedUpdated';
  scoresheetId: string;
  escalated: boolean;
};

export type ScoresheetSignatureUpdatedEvent = {
  __typename: 'ScoresheetSignatureUpdated';
  scoresheetId: string;
  signature: string | null;
  status: string;
};

export type ScoresheetResetEvent = {
  __typename: 'ScoresheetResetEvent';
  scoresheetId: string;
  status: string;
};

export type ScoresheetUpdatedEvent =
  | ScoresheetMissionClauseUpdatedEvent
  | ScoresheetStatusUpdatedEvent
  | ScoresheetGPUpdatedEvent
  | ScoresheetEscalatedUpdatedEvent
  | ScoresheetSignatureUpdatedEvent
  | ScoresheetResetEvent;

export type SubscriptionResult = {
  scoresheetUpdated: ScoresheetUpdatedEvent;
};

// Layout query types
export interface MatchParticipant {
  id: string;
  team: {
    id: string;
  } | null;
  table: {
    id: string;
  };
}

export interface MatchData {
  id: string;
  status: string;
  round: number;
  participants: MatchParticipant[];
}

export type GetTeamMatchQueryData = {
  division?: {
    id: string;
    field: {
      matches: MatchData[];
    };
  } | null;
};

export type GetTeamMatchQueryVars = {
  divisionId: string;
  stage: string;
  round: number;
  teamId: string;
};

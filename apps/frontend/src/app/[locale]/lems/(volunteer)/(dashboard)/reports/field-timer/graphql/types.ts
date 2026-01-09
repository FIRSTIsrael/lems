export interface Match {
  id: string;
  slug: string;
  stage: string;
  round: number;
  number: number;
  scheduledTime: string;
  status: string;
  startTime: string | null;
  startDelta: number | null;
}

export interface Field {
  divisionId: string;
  activeMatch: string | null;
  matchLength: number;
  matches: Match[];
}

export interface Division {
  id: string;
  field: Field;
}

export interface QueryData {
  division: Division | null;
}

export interface QueryVars {
  divisionId: string;
  activeMatchId: string | null;
}

export interface MatchStartedSubscriptionData {
  matchStarted: {
    matchId: string;
    startTime: string;
    startDelta: number;
  };
}

export interface MatchCompletedSubscriptionData {
  matchCompleted: {
    matchId: string;
  };
}

export interface MatchAbortedSubscriptionData {
  matchAborted: {
    matchId: string;
  };
}

export interface SubscriptionVars {
  divisionId: string;
}

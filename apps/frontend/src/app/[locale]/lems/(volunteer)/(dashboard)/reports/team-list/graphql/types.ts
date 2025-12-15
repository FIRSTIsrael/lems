export interface Team {
  id: string;
  number: number;
  name: string;
  affiliation: string;
  city: string;
  region: string;
  arrived: boolean;
}

export interface TeamEvent {
  teamId: string;
  version: number;
}

export type QueryData = { division?: { id: string; teams: Team[] } | null };
export type QueryVars = { divisionId: string };

export type SubscriptionData = { teamArrivalUpdated: TeamEvent };
export type SubscriptionVars = QueryVars & { lastSeenVersion?: number };

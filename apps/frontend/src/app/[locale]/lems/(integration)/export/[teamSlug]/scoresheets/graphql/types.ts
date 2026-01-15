export interface TeamInfo {
  id: string;
  number: number;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface DivisionInfo {
  id: string;
  name: string;
  teams: TeamInfo[];
}

export interface GetTeamInfoData {
  event: {
    id: string;
    name: string;
    seasonName?: string | null;
    divisions: DivisionInfo[];
  } | null;
}

export interface GetTeamInfoVariables {
  eventSlug: string;
  teamSlug: string;
}

export interface ScoresheetData {
  missions: unknown;
  score: number;
}

export interface ScoresheetInfo {
  id: string;
  slug: string;
  stage: 'PRACTICE' | 'RANKING';
  round: number;
  status: string;
  escalated?: boolean | null;
  data: ScoresheetData | null;
}

export interface GetScoresheetsData {
  division: {
    id: string;
    name: string;
    teams: Array<{
      id: string;
      number: number;
      name: string;
      scoresheets: ScoresheetInfo[];
    }>;
  } | null;
}

export interface GetScoresheetsVariables {
  divisionId: string;
  teamId: string;
}

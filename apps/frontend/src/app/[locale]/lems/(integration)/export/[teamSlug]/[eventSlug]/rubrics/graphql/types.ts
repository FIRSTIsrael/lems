export interface RubricFieldData {
  value: number | null;
  notes?: string | null;
}

export interface RubricData {
  awards?: string[];
  fields: Record<string, RubricFieldData>;
  feedback?: {
    greatJob: string;
    thinkAbout: string;
  };
}

export interface RubricInfo {
  id: string;
  category: string;
  status: string;
  data: RubricData | null;
}

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

export interface GetRubricsData {
  division: {
    id: string;
    name: string;
    judging: {
      awards: Array<{
        id: string;
        name: string;
      }>;
      rubrics: RubricInfo[];
    };
  };
}

export interface GetRubricsVariables {
  divisionId: string;
  teamId: string;
}

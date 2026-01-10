export type AudienceDisplayScreen =
  | 'scoreboard'
  | 'match_preview'
  | 'sponsors'
  | 'logo'
  | 'message'
  | 'awards';

export interface AudienceDisplayState {
  activeDisplay: AudienceDisplayScreen;
  settings?: Record<AudienceDisplayScreen, Record<string, unknown>>;
}

export interface TeamWinner {
  id: string;
  name: string;
  number: number;
  affiliation: {
    id: string;
    name: string;
    city: string;
  } | null;
}

export interface PersonalWinner {
  id: string;
  name: string;
  team: {
    id: string;
    number: number;
    name: string;
  };
}

export interface Award {
  id: string;
  name: string;
  index: number;
  place: number;
  type: 'PERSONAL' | 'TEAM';
  isOptional: boolean;
  winner?: TeamWinner | PersonalWinner | null;
}

export interface AudienceDisplayData {
  division: {
    id: string;
    awards_assigned: boolean;
    field: {
      audienceDisplay: AudienceDisplayState | null;
      judging: {
        awards: Award[];
      } | null;
    };
  };
}

export interface AudienceDisplayVars {
  divisionId: string;
}

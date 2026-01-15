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
  team: {
    id: string;
    name: string;
    number: string;
    affiliation: string;
  };
}

export interface PersonalWinner {
  name: string;
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
    awardsAssigned: boolean;
    field: {
      audienceDisplay: AudienceDisplayState | null;
    };
    judging: {
      awards: Award[];
    };
  };
}

export interface AudienceDisplayVars {
  divisionId: string;
}

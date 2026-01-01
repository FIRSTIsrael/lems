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

export interface AudienceDisplayData {
  division: {
    id: string;
    field: {
      audienceDisplay: AudienceDisplayState | null;
    };
  };
}

export interface AudienceDisplayVars {
  divisionId: string;
}

export type AudienceDisplayScreen =
  | 'scoreboard'
  | 'match_preview'
  | 'sponsors'
  | 'logo'
  | 'message'
  | 'awards';

export interface DivisionState {
  divisionId: string;
  field?: {
    loadedMatch: string | null;
    activeMatch: string | null;
    currentStage: 'PRACTICE' | 'RANKING';
  };
  audienceDisplay?: {
    activeDisplay: AudienceDisplayScreen;
    settings?: Record<AudienceDisplayScreen, Record<string, unknown>>;
  };
}

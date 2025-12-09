import { gql } from '@apollo/client';

export type AudienceDisplayScreen =
  | 'scoreboard'
  | 'match-preview'
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

export const GET_AUDIENCE_DISPLAY_DATA = gql`
  query GetAudienceDisplayData($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
        audienceDisplay {
          activeDisplay
          settings
        }
      }
    }
  }
`;

export function parseAudienceDisplayData(data: AudienceDisplayData) {
  return data.division.field.audienceDisplay;
}

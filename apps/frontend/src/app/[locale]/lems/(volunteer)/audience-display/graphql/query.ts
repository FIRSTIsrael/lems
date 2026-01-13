import { gql } from '@apollo/client';
import { AudienceDisplayData } from './types';

export const GET_AUDIENCE_DISPLAY_DATA = gql`
  query GetAudienceDisplayData($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
        divisionId
        audienceDisplay {
          activeDisplay
          settings
        }
      }
    }
  }
`;

export function parseAudienceDisplayData(data: AudienceDisplayData) {
  return data.division.field.audienceDisplay ?? {
    activeDisplay: 'logo'
  };
}

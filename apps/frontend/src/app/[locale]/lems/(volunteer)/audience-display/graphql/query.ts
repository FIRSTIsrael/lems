import { gql } from '@apollo/client';
import { AudienceDisplayData } from './types';

export const GET_AUDIENCE_DISPLAY_DATA = gql`
  query GetAudienceDisplayData($divisionId: String!) {
    division(id: $divisionId) {
      id
      awardsAssigned
      field {
        divisionId
        audienceDisplay {
          activeDisplay
          settings
        }
      }
      judging {
        divisionId
        awards {
          id
          name
          index
          place
          type
          isOptional
          winner {
            ... on TeamWinner {
              team {
                id
                name
                number
                affiliation
              }
            }
            ... on PersonalWinner {
              name
            }
          }
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

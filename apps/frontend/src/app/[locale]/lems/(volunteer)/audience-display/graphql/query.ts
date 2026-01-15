import { gql } from '@apollo/client';
import { AudienceDisplayData, AudienceDisplayState } from './types';

export const GET_AUDIENCE_DISPLAY_DATA = gql`
  query GetAudienceDisplayData($divisionId: String!) {
    division(id: $divisionId) {
      id
      awards_assigned
      field {
        divisionId
        audienceDisplay {
          activeDisplay
          settings
        }
        judging {
          awards {
            id
            name
            index
            place
            type
            isOptional
            winner {
              ... on TeamWinner {
                id
                name
                number
                affiliation {
                  id
                  name
                  city
                }
              }
              ... on PersonalWinner {
                id
                name
                team {
                  id
                  number
                  name
                }
              }
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

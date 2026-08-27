import { gql } from '@apollo/client';
import { AudienceDisplayData, AudienceDisplayState } from './types';

export const GET_AUDIENCE_DISPLAY_DATA = gql`
  query GetAudienceDisplayData($divisionId: String!) {
    division(id: $divisionId) {
      id
      awardsAssigned
      teams {
        id
      }
      field {
        divisionId
        audienceDisplay {
          activeDisplay
          awardsPresentation {
            slideIndex
            stepIndex
          }
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
                city
                affiliation
                logoUrl
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
  const audienceDisplay =
    data.division.field.audienceDisplay ??
    ({
      activeDisplay: 'welcome'
    } as AudienceDisplayState);

  // Normalize legacy `logo` mode (pre-migration) to `welcome`
  if ((audienceDisplay.activeDisplay as string) === 'logo') {
    audienceDisplay.activeDisplay = 'welcome';
  }

  return audienceDisplay;
}

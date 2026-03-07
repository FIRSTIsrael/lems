import { gql, TypedDocumentNode } from '@apollo/client';
import type { McData, McVars, ParsedMcData } from './types';

export const GET_MC_DATA: TypedDocumentNode<McData, McVars> = gql`
  query GetMcData($divisionId: String!) {
    division(id: $divisionId) {
      id
      awardsAssigned
      judging {
        divisionId
        awards {
          id
          name
          index
          place
          type
          description
          showPlaces
          winner {
            __typename
            ... on TeamWinner {
              team {
                id
                name
                number
                affiliation
                city
                region
              }
            }
            ... on PersonalWinner {
              name
            }
          }
        }
        advancementPercentage
      }
      field {
        divisionId
        matches {
          id
          slug
          stage
          round
          number
          scheduledTime
          startTime
          status
          participants {
            id
            team {
              id
              name
              number
              affiliation
              city
              arrived
            }
            table {
              id
              name
            }
          }
        }
        currentStage
        loadedMatch
      }
    }
  }
`;

export function parseMcData(queryData: McData): ParsedMcData {
  const field = queryData.division?.field;
  if (!field) {
    return {
      matches: [],
      currentStage: 'PRACTICE',
      loadedMatch: null,
      awardsAssigned: false,
      awards: [],
      isAdvancementEnabled: false
    };
  }

  // Filter to only current stage matches and exclude completed matches
  const currentStageMatches = field.matches.filter(
    match => match.stage === field.currentStage && match.status !== 'completed'
  );

  const awards = queryData.division?.judging?.awards ?? [];
  const advancementPercentage = queryData.division?.judging?.advancementPercentage ?? null;

  return {
    matches: currentStageMatches,
    currentStage: field.currentStage,
    loadedMatch: field.loadedMatch,
    awardsAssigned: queryData.division?.awardsAssigned ?? false,
    awards,
    isAdvancementEnabled: advancementPercentage !== null && advancementPercentage > 0
  };
}

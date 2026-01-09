import { gql, TypedDocumentNode } from '@apollo/client';
import type { McData, McVars, ParsedMcData } from './types';

export const GET_MC_DATA: TypedDocumentNode<McData, McVars> = gql`
  query GetMcData($divisionId: String!) {
    division(id: $divisionId) {
      id
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
      loadedMatch: null
    };
  }

  // Filter to only current stage matches and exclude completed matches
  const currentStageMatches = field.matches.filter(
    match => match.stage === field.currentStage && match.status !== 'completed'
  );

  return {
    matches: currentStageMatches,
    currentStage: field.currentStage,
    loadedMatch: field.loadedMatch
  };
}

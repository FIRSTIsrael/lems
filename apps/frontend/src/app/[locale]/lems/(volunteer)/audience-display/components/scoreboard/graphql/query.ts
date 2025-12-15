import { gql, TypedDocumentNode } from '@apollo/client';
import { ScoreboardData, ScoreboardVars } from './types';

export const GET_SCOREBOARD_DATA: TypedDocumentNode<ScoreboardData, ScoreboardVars> = gql`
  query GetScoreboardData($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
        matches {
          id
          stage
          round
          number
          participants {
            team {
              id
              name
              number
              affiliation
              city
              arrived
              logoUrl
            }
            table {
              id
              name
            }
          }
        }
        scoresheets {
          id
          team {
            id
          }
          stage
          round
          status
          escalated
          data {
            score
          }
        }
        currentStage
        loadedMatch
        activeMatch
        matchLength
      }
    }
  }
`;

export function parseScoreboardData(data: ScoreboardData) {
  return data.division.field;
}

import { gql, TypedDocumentNode } from '@apollo/client';
import { MatchPreviewData, MatchPreviewVars } from './types';

export const GET_MATCH_PREVIEW_DATA: TypedDocumentNode<MatchPreviewData, MatchPreviewVars> = gql`
  query GetMatchPreviewData($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
        divisionId
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
        loadedMatch
      }
    }
  }
`;

export function parseMatchPreviewData(data: MatchPreviewData) {
  const matches = data.division.field.matches;
  const loadedMatch = data.division.field.loadedMatch;
  return { matches, loadedMatch };
}

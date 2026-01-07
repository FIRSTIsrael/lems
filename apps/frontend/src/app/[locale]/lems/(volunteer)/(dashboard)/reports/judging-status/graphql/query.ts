import { gql, TypedDocumentNode } from '@apollo/client';
import type { QueryData, QueryVars } from './types';

export const GET_JUDGING_STATUS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetJudgingStatus($divisionId: String!) {
    division(id: $divisionId) {
      id
      rooms {
        id
        name
      }
      judging {
        id: divisionId
        divisionId
        sessions {
          id
          number
          scheduledTime
          status
          called
          room {
            id
            name
          }
          team {
            id
            number
            name
            affiliation
            city
            slug
            region
            logoUrl
            arrived
          }
          startTime
          startDelta
        }
        sessionLength
      }
      field {
        divisionId
        activeMatch
        loadedMatch
      }
    }
  }
`;

export function parseJudgingStatus(queryData: QueryData) {
  return {
    sessions: queryData?.division?.judging.sessions ?? [],
    rooms: queryData?.division?.rooms ?? [],
    sessionLength: queryData?.division?.judging.sessionLength ?? 0
  };
}

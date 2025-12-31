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
        activeMatch
        loadedMatch
      }
      matches(stage: RANKING) {
        id
        stage
        status
        called
        participants {
          team {
            id
            number
            name
            affiliation
          }
        }
      }
    }
  }
`;

export function parseJudgingStatus(queryData: QueryData) {
  return {
    sessions: queryData?.division?.judging.sessions ?? [],
    rooms: queryData?.division?.rooms ?? [],
    sessionLength: queryData?.division?.judging.sessionLength ?? 0,
    field: queryData?.division?.field ?? { activeMatch: null, loadedMatch: null },
    matches: queryData?.division?.matches ?? []
  };
}

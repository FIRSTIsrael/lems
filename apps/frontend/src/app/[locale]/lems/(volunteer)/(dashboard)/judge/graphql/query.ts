import { gql, TypedDocumentNode } from '@apollo/client';
import type { QueryData, QueryVars } from './types';

export const GET_ROOM_JUDGING_SESSIONS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetRoomJudgingSessions($divisionId: String!, $roomId: String!) {
    division(id: $divisionId) {
      id
      judging {
        sessions(roomId: $roomId) {
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
            region
            slug
            logoUrl
            arrived
            location
          }
          rubrics {
            innovationProject {
              ...RubricFields
            }
            robotDesign {
              ...RubricFields
            }
            coreValues {
              ...RubricFields
            }
          }
          startTime
          startDelta
        }
        rooms
        sessionLength
      }
    }
  }

  fragment RubricFields on Rubric {
    id
    status
  }
`;

export function parseRoomJudgingSessions(data: QueryData) {
  return data.division?.judging || null;
}

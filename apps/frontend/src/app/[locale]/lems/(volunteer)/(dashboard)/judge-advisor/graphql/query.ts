import { gql, TypedDocumentNode } from '@apollo/client';
import type { QueryData, QueryVars } from './types';

export const GET_ALL_JUDGING_SESSIONS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetAllJudgingSessions($divisionId: String!) {
    division(id: $divisionId) {
      id
      rooms {
        id
        name
      }
      judging {
        sessions {
          id
          number
          scheduledTime
          status
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
          rubrics {
            innovation_project {
              ...RubricFields
            }
            robot_design {
              ...RubricFields
            }
            core_values {
              ...RubricFields
            }
          }
          startTime
          startDelta
        }
        sessionLength
      }
    }
  }

  fragment RubricFields on Rubric {
    id
    status
  }
`;

export function parseDivisionSessions(queryData: QueryData) {
  return queryData?.division?.judging.sessions ?? [];
}

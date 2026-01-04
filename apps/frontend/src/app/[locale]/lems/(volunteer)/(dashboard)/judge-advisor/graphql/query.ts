import { gql, TypedDocumentNode } from '@apollo/client';
import type { QueryData, QueryVars } from './types';

export const GET_ALL_JUDGING_SESSIONS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetAllJudgingSessions($divisionId: String!) {
    division(id: $divisionId) {
      id
      awards {
        id
        name
        index
        place
        type
        isOptional
        allowNominations
        automaticAssignment
        description
      }
      judging {
        divisionId
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
            disqualified
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
        deliberations {
          id
          category
          status
          startTime
          picklist
        }
        finalDeliberation {
          divisionId
          stage
          status
          startTime
          completionTime
          champions
          innovationProject
          robotDesign
          coreValues
          optionalAwards
        }
      }
    }
  }

  fragment RubricFields on Rubric {
    id
    status
  }
`;

export function parseDivisionSessions(queryData: QueryData) {
  const division = queryData?.division;
  if (!division) {
    return {
      sessions: [],
      sessionLength: 0,
      awards: [],
      deliberations: [],
      finalDeliberation: null
    };
  }

  const sessions = division.judging.sessions ?? [];
  const filteredSessions = sessions.filter(session => !!session.team);
  const awards = division.awards ?? [];
  const deliberations = division.judging.deliberations ?? [];
  const finalDeliberation = division.judging.finalDeliberation ?? null;

  return {
    sessions: filteredSessions,
    sessionLength: filteredSessions.length,
    awards,
    deliberations,
    finalDeliberation
  };
}

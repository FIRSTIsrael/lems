import { gql, TypedDocumentNode } from '@apollo/client';
import type { QueryData, QueryVars, JudgingData } from './types';

export const GET_ALL_JUDGING_SESSIONS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetAllJudgingSessions($divisionId: String!) {
    division(id: $divisionId) {
      id
      judging {
        divisionId
        sessionLength
        awards(allowNominations: false) {
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
        innovation_project: deliberation(category: innovation_project) {
          id
          category
          status
          startTime
          picklist
        }
        robot_design: deliberation(category: robot_design) {
          id
          category
          status
          startTime
          picklist
        }
        core_values: deliberation(category: core_values) {
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
      deliberations: {},
      finalDeliberation: null
    };
  }

  const sessions = division.judging.sessions ?? [];
  const filteredSessions = sessions.filter(session => !!session.team);

  const personalAwards = (division.awards ?? []).filter(award => award.type === 'PERSONAL');

  const judgingData = division.judging as JudgingData;
  const deliberations = {
    innovation_project: judgingData.innovation_project,
    robot_design: judgingData.robot_design,
    core_values: judgingData.core_values
  };

  const finalDeliberation = division.judging.finalDeliberation ?? null;

  return {
    sessions: filteredSessions,
    sessionLength: division.judging.sessionLength,
    awards: personalAwards,
    deliberations,
    finalDeliberation
  };
}

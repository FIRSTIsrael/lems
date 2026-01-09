import { gql, TypedDocumentNode } from '@apollo/client';
import type { QueryData, QueryVars, Deliberation, JudgingSession } from './types';

export interface LeadJudgePageData {
  sessions: JudgingSession[];
  deliberation: Deliberation | null;
  sessionLength: number;
}

export const GET_LEAD_JUDGE_DATA: TypedDocumentNode<QueryData, QueryVars & { category: string }> =
  gql`
    query GetLeadJudgeData($divisionId: String!, $category: JudgingCategory!) {
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
          deliberation(category: $category) {
            id
            category
            status
            startTime
            picklist
          }
        }
      }
    }

    fragment RubricFields on Rubric {
      id
      status
    }
  `;

export function parseLeadJudgeData(queryData: QueryData): LeadJudgePageData {
  const judging = queryData?.division?.judging;
  const sessions = judging?.sessions ?? [];
  const sessionLength = judging?.sessionLength ?? 0;

  const deliberation = judging?.deliberation ?? null;

  return {
    sessions: sessions.filter(session => !!session.team),
    deliberation,
    sessionLength
  };
}

export function getLeadJudgeCategory(category: string | undefined): string {
  if (!category) {
    throw new Error('Lead judge must have a category in roleInfo');
  }
  return category.toLowerCase();
}

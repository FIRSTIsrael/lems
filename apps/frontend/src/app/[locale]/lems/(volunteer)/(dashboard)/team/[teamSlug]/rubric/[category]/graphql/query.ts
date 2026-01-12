import { gql, TypedDocumentNode } from '@apollo/client';
import { underscoresToHyphens } from '@lems/shared/utils';
import { JudgingCategory } from '@lems/types/judging';
import { getEmptyRubric } from '../rubric-utils';
import type {
  QueryResult,
  QueryVariables,
  GetTeamSessionQueryData,
  GetTeamSessionQueryVars,
  PageData
} from './types';

export const GET_RUBRIC_QUERY: TypedDocumentNode<QueryResult, QueryVariables> = gql`
  query GetRubric($divisionId: String!, $teamId: String!, $category: JudgingCategory!) {
    division(id: $divisionId) {
      id
      judging {
        divisionId
        awards(allowNominations: true) {
          id
          name
        }
        rubrics(teamIds: [$teamId], category: $category) {
          id
          category
          status
          data {
            awards
            fields
            feedback {
              greatJob
              thinkAbout
            }
          }
        }
      }
    }
  }
`;

export const GET_TEAM_SESSION_QUERY: TypedDocumentNode<
  GetTeamSessionQueryData,
  GetTeamSessionQueryVars
> = gql`
  query GetTeamSession($divisionId: String!, $teamId: String!) {
    division(id: $divisionId) {
      id
      judging {
        divisionId
        sessions(teamIds: [$teamId]) {
          id
          number
          status
          room {
            id
          }
        }
      }
    }
  }
`;

export function parseRubricData(queryData: QueryResult): PageData {
  const judging = queryData.division.judging;

  if (!judging.rubrics || judging.rubrics.length === 0) {
    throw new Error('Rubric not found');
  }

  if (!judging.rubrics[0].data) {
    return {
      awards: judging.awards,
      rubric: {
        ...judging.rubrics[0],
        data: getEmptyRubric(underscoresToHyphens(judging.rubrics[0].category) as JudgingCategory)
      }
    };
  }

  return { awards: judging.awards, rubric: { ...judging.rubrics[0] } };
}

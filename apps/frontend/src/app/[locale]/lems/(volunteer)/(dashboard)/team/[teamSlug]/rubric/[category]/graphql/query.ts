import { gql, TypedDocumentNode } from '@apollo/client';
import { underscoresToHyphens } from '@lems/shared/utils';
import { JudgingCategory } from '@lems/types/judging';
import { getEmptyRubric } from '../rubric-utils';
import type {
  QueryResult,
  QueryVariables,
  AwardOptionsQueryResult,
  AwardOptionsQueryVariables,
  GetTeamSessionQueryData,
  GetTeamSessionQueryVars,
  RubricItem
} from './types';

export const GET_RUBRIC_QUERY: TypedDocumentNode<QueryResult, QueryVariables> = gql`
  query GetRubric($divisionId: String!, $teamId: String!, $category: JudgingCategory!) {
    division(id: $divisionId) {
      id
      judging {
        divisionId
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

export const GET_AWARD_OPTIONS_QUERY: TypedDocumentNode<
  AwardOptionsQueryResult,
  AwardOptionsQueryVariables
> = gql`
  query GetAwardOptions($divisionId: String!) {
    division(id: $divisionId) {
      id
      judging {
        awards(allowNominations: true) {
          id
          name
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

export function parseRubricData(queryData: QueryResult): RubricItem {
  const rubric = queryData.division.judging.rubrics[0];

  if (!rubric) {
    throw new Error('Rubric not found');
  }

  if (!rubric.data) {
    return {
      ...rubric,
      data: getEmptyRubric(underscoresToHyphens(rubric.category) as JudgingCategory)
    };
  }

  return rubric;
}

/**
 * Parses the award options query result and returns a Set of award names.
 */
export function parseAwardOptions(queryData: AwardOptionsQueryResult): Set<string> {
  const awards = (queryData?.division as any)?.judging?.awards ?? [];
  return new Set(awards.map((award: any) => award.name));
}

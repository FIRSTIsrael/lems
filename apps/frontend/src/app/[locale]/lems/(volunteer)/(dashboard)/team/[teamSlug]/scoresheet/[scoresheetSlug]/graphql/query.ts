import { gql, type TypedDocumentNode } from '@apollo/client';
import { getEmptyScoresheet } from '../scoresheet-utils';
import type {
  QueryResult,
  QueryVariables,
  ScoresheetItem,
  GetTeamMatchQueryData,
  GetTeamMatchQueryVars
} from './types';

export const GET_SCORESHEET_QUERY: TypedDocumentNode<QueryResult, QueryVariables> = gql`
  query GetScoresheet($divisionId: String!, $teamId: String!, $slug: String!) {
    division(id: $divisionId) {
      id
      field {
        scoresheets(teamIds: [$teamId], slug: $slug) {
          id
          team {
            id
          }
          divisionId
          slug
          stage
          round
          status
          escalated
          data {
            missions
            signature
            gp {
              value
              notes
            }
            score
          }
        }
      }
    }
  }
`;

export function parseScoresheetData(queryData: QueryResult): ScoresheetItem {
  const scoresheet = queryData.division.field.scoresheets[0];

  if (!scoresheet) {
    throw new Error('Scoresheet not found');
  }

  if (!scoresheet.data) {
    return {
      ...scoresheet,
      data: getEmptyScoresheet()
    };
  }

  return scoresheet;
}

export const GET_TEAM_MATCH_QUERY: TypedDocumentNode<GetTeamMatchQueryData, GetTeamMatchQueryVars> =
  gql`
    query GetTeamMatch($divisionId: String!, $stage: String!, $round: Int!, $teamId: String!) {
      division(id: $divisionId) {
        id
        field {
          matches(stage: $stage, round: $round, teamIds: [$teamId]) {
            id
            status
            round
            participants {
              team {
                id
              }
              table {
                id
              }
            }
          }
        }
      }
    }
  `;

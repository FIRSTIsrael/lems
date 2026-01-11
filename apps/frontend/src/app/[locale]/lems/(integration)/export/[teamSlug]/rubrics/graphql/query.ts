import { gql, TypedDocumentNode } from '@apollo/client';
import type {
  GetAllRubricsExportQueryResult,
  GetAllRubricsExportQueryVariables,
  ParsedRubricsExportData
} from './types';

export const GET_ALL_RUBRICS_EXPORT_QUERY: TypedDocumentNode<
  GetAllRubricsExportQueryResult,
  GetAllRubricsExportQueryVariables
> = gql`
  query GetAllRubricsExport($divisionId: String!, $teamId: String!) {
    division(id: $divisionId) {
      id
      judging {
        rubrics(teamIds: [$teamId]) {
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
        awards(allowNominations: true) {
          id
          name
        }
      }
    }
    team(id: $teamId) {
      id
      number
    }
  }
`;

export function parseRubricsExportData(
  queryData: GetAllRubricsExportQueryResult
): ParsedRubricsExportData {
  return {
    rubrics: queryData.division.judging.rubrics,
    awards: queryData.division.judging.awards,
    team: queryData.team
  };
}

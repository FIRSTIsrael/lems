import { gql, TypedDocumentNode } from '@apollo/client';
import type {
  GetAllScoresheetsExportQueryResult,
  GetAllScoresheetsExportQueryVariables,
  ParsedScoresheetsExportData
} from './types';

export const GET_ALL_SCORESHEETS_EXPORT_QUERY: TypedDocumentNode<
  GetAllScoresheetsExportQueryResult,
  GetAllScoresheetsExportQueryVariables
> = gql`
  query GetAllScoresheetsExport($divisionId: String!, $teamId: String!) {
    division(id: $divisionId) {
      id
      judging {
        scoresheets(teamIds: [$teamId]) {
          id
          slug
          stage
          round
          status
          escalated
          data {
            missions
            signature
            score
          }
        }
      }
    }
    team(id: $teamId) {
      id
      number
    }
  }
`;

export function parseScoresheetsExportData(
  queryData: GetAllScoresheetsExportQueryResult
): ParsedScoresheetsExportData {
  return {
    scoresheets: queryData.division.judging.scoresheets,
    team: queryData.team
  };
}

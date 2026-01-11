import { gql, TypedDocumentNode } from '@apollo/client';

export interface ScoresheetExportData {
  id: string;
  slug: string;
  stage: string;
  round: number;
  status: string;
  escalated: boolean;
  data: {
    missions: Record<string, { points: number; value: number }>;
    signature: string;
    score: number;
  };
}

export interface DivisionData {
  id: string;
  judging: {
    scoresheets: ScoresheetExportData[];
  };
}

export interface TeamData {
  id: string;
  number: number;
}

export interface QueryResult {
  division: DivisionData;
  team: TeamData;
}

export interface QueryVariables {
  divisionId: string;
  teamId: string;
}

export const GET_ALL_SCORESHEETS_EXPORT_QUERY: TypedDocumentNode<QueryResult, QueryVariables> = gql`
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

export function parseScoresheetsExportData(queryData: QueryResult) {
  return {
    scoresheets: queryData.division.judging.scoresheets,
    team: queryData.team
  };
}

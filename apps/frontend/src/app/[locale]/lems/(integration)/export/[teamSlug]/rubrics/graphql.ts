import { gql, TypedDocumentNode } from '@apollo/client';
import { JudgingCategory } from '@lems/types/judging';

export interface RubricExportData {
  id: string;
  category: JudgingCategory;
  status: string;
  data: {
    awards: Record<string, boolean>;
    fields: Record<string, number>;
    feedback: {
      greatJob: string;
      thinkAbout: string;
    };
  };
}

export interface DivisionData {
  id: string;
  judging: {
    rubrics: RubricExportData[];
    awards: Array<{
      id: string;
      name: string;
    }>;
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

export const GET_ALL_RUBRICS_EXPORT_QUERY: TypedDocumentNode<QueryResult, QueryVariables> = gql`
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

export function parseRubricsExportData(queryData: QueryResult) {
  return {
    rubrics: queryData.division.judging.rubrics,
    awards: queryData.division.judging.awards,
    team: queryData.team
  };
}

import { gql, type TypedDocumentNode } from '@apollo/client';
import { getEmptyScoresheet } from './scoresheet-utils';

export interface ScoresheetData {
  missions: Record<string, Record<number, boolean | string | number | null>>;
  signature?: string;
  gp: {
    value: number | null;
    notes?: string;
  };
  score: number;
}

export interface ScoresheetItem {
  id: string;
  team: {
    id: string;
  };
  divisionId: string;
  slug: string;
  stage: string;
  round: number;
  status: string;
  escalated?: boolean;
  data: ScoresheetData;
}

type QueryResult = {
  division: {
    id: string;
    field: {
      scoresheets: ScoresheetItem[];
    };
  };
};

type QueryVariables = {
  divisionId: string;
  teamId: string;
  slug: string;
};

type MissionClauseMutationResult = {
  updateScoresheetMissionClause: {
    scoresheetId: string;
    missionId: string;
    clauseIndex: number;
    value: boolean | string | number | null;
    version: number;
  };
};

type MissionClauseMutationVariables = {
  divisionId: string;
  scoresheetId: string;
  missionId: string;
  clauseIndex: number;
  value: boolean | string | number | null;
};

/**
 * Query to fetch a single scoresheet for a team and match
 */
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

/**
 * Mutation to update a mission clause value in a scoresheet
 */
export const UPDATE_SCORESHEET_MISSION_CLAUSE_MUTATION: TypedDocumentNode<
  MissionClauseMutationResult,
  MissionClauseMutationVariables
> = gql`
  mutation UpdateScoresheetMissionClause(
    $divisionId: String!
    $scoresheetId: String!
    $missionId: String!
    $clauseIndex: Int!
    $value: JSON!
  ) {
    updateScoresheetMissionClause(
      divisionId: $divisionId
      scoresheetId: $scoresheetId
      missionId: $missionId
      clauseIndex: $clauseIndex
      value: $value
    ) {
      scoresheetId
      missionId
      clauseIndex
      value
      version
    }
  }
`;

/**
 * Parses the query result to extract the first scoresheet.
 * If the scoresheet has no data, creates an empty scoresheet data object.
 */
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

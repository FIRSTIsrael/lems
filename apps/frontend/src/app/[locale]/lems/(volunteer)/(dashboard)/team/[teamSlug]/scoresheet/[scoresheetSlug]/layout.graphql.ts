import { gql, type TypedDocumentNode } from '@apollo/client';

export interface MatchParticipant {
  team: {
    id: string;
  } | null;
  table: {
    id: string;
  };
}

export interface MatchData {
  id: string;
  status: string;
  round: number;
  participants: MatchParticipant[];
}

export type GetTeamMatchQueryData = {
  division?: {
    id: string;
    field: {
      matches: MatchData[];
    };
  } | null;
};

export type GetTeamMatchQueryVars = {
  divisionId: string;
  stage: string;
  round: number;
  teamId: string;
};

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

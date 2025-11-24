import { gql, type TypedDocumentNode } from '@apollo/client';
import { Judging } from '../../../../judge/judge.graphql';

type QueryData = { division?: { id: string; judging: Judging } | null };
type QueryVars = { divisionId: string; teamId: string };

export const GET_TEAM_SESSION_QUERY: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetTeamSession($divisionId: String!, $teamId: String!) {
    division(id: $divisionId) {
      id
      judging {
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

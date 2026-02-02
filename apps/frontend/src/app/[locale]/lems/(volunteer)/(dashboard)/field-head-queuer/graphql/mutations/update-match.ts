import { gql, TypedDocumentNode } from '@apollo/client';

export interface UpdateMatchVars {
  divisionId: string;
  matchId: string;
  called: boolean;
}

export interface UpdateMatchData {
  updateMatch: {
    id: string;
    called: boolean;
  };
}

export const UPDATE_MATCH_MUTATION: TypedDocumentNode<UpdateMatchData, UpdateMatchVars> = gql`
  mutation UpdateMatch($divisionId: String!, $matchId: String!, $called: Boolean!) {
    updateMatch(divisionId: $divisionId, matchId: $matchId, data: { called: $called }) {
      id
      called
    }
  }
`;

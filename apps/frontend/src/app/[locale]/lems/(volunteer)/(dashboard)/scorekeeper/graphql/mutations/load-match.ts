import { gql, TypedDocumentNode } from '@apollo/client';
import type { MatchEvent } from '../types';

interface LoadMatchMutationData {
  loadMatch: MatchEvent;
}

interface LoadMatchMutationVars {
  divisionId: string;
  matchId: string;
}

export const LOAD_MATCH_MUTATION: TypedDocumentNode<LoadMatchMutationData, LoadMatchMutationVars> =
  gql`
    mutation LoadMatch($divisionId: String!, $matchId: String!) {
      loadMatch(divisionId: $divisionId, matchId: $matchId) {
        matchId
      }
    }
  `;

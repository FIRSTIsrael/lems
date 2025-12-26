import { gql, TypedDocumentNode } from '@apollo/client';
import type { MatchEvent } from '../types';

interface StartMatchMutationData {
  startMatch: MatchEvent;
}

interface StartMatchMutationVars {
  divisionId: string;
  matchId: string;
}

export const START_MATCH_MUTATION: TypedDocumentNode<
  StartMatchMutationData,
  StartMatchMutationVars
> = gql`
  mutation StartMatch($divisionId: String!, $matchId: String!) {
    startMatch(divisionId: $divisionId, matchId: $matchId) {
      matchId
      startTime
      startDelta
    }
  }
`;

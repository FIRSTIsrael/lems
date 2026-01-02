import { gql, TypedDocumentNode } from '@apollo/client';

interface MatchAbortedEvent {
  matchId: string;
}

interface AbortMatchMutationData {
  abortMatch: MatchAbortedEvent;
}

interface AbortMatchMutationVars {
  divisionId: string;
  matchId: string;
}

export const ABORT_MATCH_MUTATION: TypedDocumentNode<
  AbortMatchMutationData,
  AbortMatchMutationVars
> = gql`
  mutation AbortMatch($divisionId: String!, $matchId: String!) {
    abortMatch(divisionId: $divisionId, matchId: $matchId) {
      matchId
    }
  }
`;

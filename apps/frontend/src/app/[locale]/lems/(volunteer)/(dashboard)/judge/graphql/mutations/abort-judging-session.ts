import { gql, TypedDocumentNode } from '@apollo/client';

interface AbortJudgingSessionMutationData {
  abortJudgingSession: {
    sessionId: string;
    version: number;
  };
}

interface AbortJudgingSessionMutationVars {
  divisionId: string;
  sessionId: string;
}

export const ABORT_JUDGING_SESSION_MUTATION: TypedDocumentNode<
  AbortJudgingSessionMutationData,
  AbortJudgingSessionMutationVars
> = gql`
  mutation AbortJudgingSession($divisionId: String!, $sessionId: String!) {
    abortJudgingSession(divisionId: $divisionId, sessionId: $sessionId) {
      sessionId
      version
    }
  }
`;

import { gql, TypedDocumentNode } from '@apollo/client';

interface StartJudgingSessionMutationData {
  startJudgingSession: JudgingStartedEvent;
}

interface StartJudgingSessionMutationVars {
  divisionId: string;
  sessionId: string;
}

interface JudgingStartedEvent {
  sessionId: string;
  version: number;
  startTime: string;
  startDelta: number;
}

export const START_JUDGING_SESSION_MUTATION: TypedDocumentNode<
  StartJudgingSessionMutationData,
  StartJudgingSessionMutationVars
> = gql`
  mutation StartJudgingSession($divisionId: String!, $sessionId: String!) {
    startJudgingSession(divisionId: $divisionId, sessionId: $sessionId) {
      sessionId
      version
      startTime
      startDelta
    }
  }
`;

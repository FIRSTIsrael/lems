import { gql, TypedDocumentNode } from '@apollo/client';

export interface UpdateSessionVars {
  divisionId: string;
  sessionId: string;
  called?: boolean;
  queued?: boolean;
}

export interface UpdateSessionData {
  updateJudgingSession: {
    id: string;
    called: boolean;
    queued: boolean;
  };
}

export const UPDATE_SESSION_MUTATION: TypedDocumentNode<UpdateSessionData, UpdateSessionVars> = gql`
  mutation UpdateJudgingSession(
    $divisionId: String!
    $sessionId: String!
    $called: Boolean
    $queued: Boolean
  ) {
    updateJudgingSession(
      divisionId: $divisionId
      sessionId: $sessionId
      data: { called: $called, queued: $queued }
    ) {
      id
      called
      queued
    }
  }
`;

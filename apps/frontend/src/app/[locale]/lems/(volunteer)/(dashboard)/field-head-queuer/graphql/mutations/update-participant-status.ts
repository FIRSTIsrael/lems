import { gql, TypedDocumentNode } from '@apollo/client';

export interface UpdateParticipantStatusVars {
  divisionId: string;
  matchId: string;
  participantId: string;
  present?: boolean;
  ready?: boolean;
}

export interface UpdateParticipantStatusData {
  updateParticipantStatus: {
    participantId: string;
    present: string | null;
    ready: string | null;
  };
}

export const UPDATE_PARTICIPANT_STATUS_MUTATION: TypedDocumentNode<
  UpdateParticipantStatusData,
  UpdateParticipantStatusVars
> = gql`
  mutation UpdateParticipantStatus(
    $divisionId: String!
    $matchId: String!
    $participantId: String!
    $present: Boolean
    $ready: Boolean
  ) {
    updateParticipantStatus(
      divisionId: $divisionId
      matchId: $matchId
      participantId: $participantId
      present: $present
      ready: $ready
    ) {
      participantId
      present
      ready
    }
  }
`;

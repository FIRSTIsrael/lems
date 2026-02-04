import { gql, TypedDocumentNode } from '@apollo/client';

export interface UpdateParticipantStatusVars {
  divisionId: string;
  matchId: string;
  participantId: string;
  queued?: boolean;
  present?: boolean;
  ready?: boolean;
}

export interface UpdateParticipantStatusData {
  updateParticipantStatus: {
    participantId: string;
    queued: string | null;
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
    $queued: Boolean
    $present: Boolean
    $ready: Boolean
  ) {
    updateParticipantStatus(
      divisionId: $divisionId
      matchId: $matchId
      participantId: $participantId
      queued: $queued
      present: $present
      ready: $ready
    ) {
      participantId
      queued
      present
      ready
    }
  }
`;

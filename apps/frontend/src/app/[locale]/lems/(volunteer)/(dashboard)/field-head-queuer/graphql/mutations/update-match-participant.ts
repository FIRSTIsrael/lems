import { gql, TypedDocumentNode } from '@apollo/client';

export interface UpdateMatchParticipantVars {
  divisionId: string;
  matchId: string;
  participantId: string;
  queued: boolean;
}

export interface UpdateMatchParticipantData {
  updateParticipantStatus: {
    participantId: string;
    queued: string | null;
  };
}

export const UPDATE_MATCH_PARTICIPANT_MUTATION: TypedDocumentNode<
  UpdateMatchParticipantData,
  UpdateMatchParticipantVars
> = gql`
  mutation UpdateMatchParticipant(
    $divisionId: String!
    $matchId: String!
    $participantId: String!
    $queued: Boolean!
  ) {
    updateParticipantStatus(
      divisionId: $divisionId
      matchId: $matchId
      participantId: $participantId
      queued: $queued
    ) {
      participantId
      queued
    }
  }
`;

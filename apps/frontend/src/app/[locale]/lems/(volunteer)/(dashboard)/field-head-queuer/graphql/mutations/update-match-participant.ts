import { gql, TypedDocumentNode } from '@apollo/client';

export interface UpdateMatchParticipantVars {
  divisionId: string;
  matchId: string;
  teamId: string;
  queued: boolean;
}

export interface UpdateMatchParticipantData {
  updateMatchParticipant: {
    matchId: string;
    teamId: string;
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
    $teamId: String!
    $queued: Boolean!
  ) {
    updateMatchParticipant(
      divisionId: $divisionId
      matchId: $matchId
      teamId: $teamId
      queued: $queued
    ) {
      matchId
      teamId
      queued
    }
  }
`;

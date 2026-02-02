import { gql, TypedDocumentNode } from '@apollo/client';

export interface UpdateMatchParticipantVars {
  divisionId: string;
  matchId: string;
  teamId: string;
  queued: boolean;
}

export interface UpdateMatchParticipantData {
  updateMatchParticipant: {
    id: string;
    participants: Array<{
      teamId: string;
      queued: boolean;
    }>;
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
      data: { queued: $queued }
    ) {
      id
      participants {
        teamId
        queued
      }
    }
  }
`;

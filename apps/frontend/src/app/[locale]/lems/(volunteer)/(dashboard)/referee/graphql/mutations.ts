import { gql, TypedDocumentNode } from '@apollo/client';

interface UpdateParticipantStatusVars {
  matchId: string;
  teamId: string;
  present: boolean;
  ready: boolean;
}

interface UpdateParticipantStatusResult {
  updateMatchParticipant: {
    matchId: string;
    teamId: string;
    present: boolean;
    ready: boolean;
  };
}

export const UPDATE_PARTICIPANT_STATUS: TypedDocumentNode<
  UpdateParticipantStatusResult,
  UpdateParticipantStatusVars
> = gql`
  mutation UpdateParticipantStatus(
    $matchId: String!
    $teamId: String!
    $present: Boolean!
    $ready: Boolean!
  ) {
    updateMatchParticipant(matchId: $matchId, teamId: $teamId, present: $present, ready: $ready) {
      matchId
      teamId
      present
      ready
    }
  }
`;

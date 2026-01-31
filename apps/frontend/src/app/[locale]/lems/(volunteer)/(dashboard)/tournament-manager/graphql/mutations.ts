import { gql, TypedDocumentNode } from '@apollo/client';
import type { Match } from './types-base';
import type { SwapMatchTeamsVars, SwapSessionTeamsVars } from './types';

export const SWAP_MATCH_TEAMS: TypedDocumentNode<{ swapMatchTeams: Match }, SwapMatchTeamsVars> =
  gql`
    mutation SwapMatchTeams(
      $divisionId: String!
      $matchId: String!
      $participantId1: String!
      $participantId2: String!
    ) {
      swapMatchTeams(
        divisionId: $divisionId
        matchId: $matchId
        participantId1: $participantId1
        participantId2: $participantId2
      ) {
        id
      }
    }
  `;

export const SWAP_SESSION_TEAMS: TypedDocumentNode<
  { swapSessionTeams: { id: string }[] },
  SwapSessionTeamsVars
> = gql`
  mutation SwapSessionTeams($divisionId: String!, $sessionId1: String!, $sessionId2: String!) {
    swapSessionTeams(divisionId: $divisionId, sessionId1: $sessionId1, sessionId2: $sessionId2) {
      id
    }
  }
`;

export interface SetMatchParticipantTeamVars {
  divisionId: string;
  matchId: string;
  participantId: string;
  teamId: string | null;
}

export const SET_MATCH_PARTICIPANT_TEAM: TypedDocumentNode<
  { setMatchParticipantTeam: { id: string } },
  SetMatchParticipantTeamVars
> = gql`
  mutation SetMatchParticipantTeam(
    $divisionId: String!
    $matchId: String!
    $participantId: String!
    $teamId: String
  ) {
    setMatchParticipantTeam(
      divisionId: $divisionId
      matchId: $matchId
      participantId: $participantId
      teamId: $teamId
    ) {
      id
    }
  }
`;

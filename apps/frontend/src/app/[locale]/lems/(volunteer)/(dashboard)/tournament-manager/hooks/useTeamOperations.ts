import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  SWAP_MATCH_TEAMS,
  SWAP_SESSION_TEAMS,
  SET_MATCH_PARTICIPANT_TEAM,
  SET_JUDGING_SESSION_TEAM,
  GET_TOURNAMENT_MANAGER_DATA
} from '../graphql';
import type { SlotInfo } from '../components/types';

export function useTeamOperations(divisionId: string) {
  const [error, setError] = useState<string | null>(null);

  const [swapMatchTeams] = useMutation(SWAP_MATCH_TEAMS, {
    refetchQueries: [{ query: GET_TOURNAMENT_MANAGER_DATA, variables: { divisionId } }]
  });

  const [swapSessionTeams] = useMutation(SWAP_SESSION_TEAMS, {
    refetchQueries: [{ query: GET_TOURNAMENT_MANAGER_DATA, variables: { divisionId } }]
  });

  const [setMatchParticipantTeam] = useMutation(SET_MATCH_PARTICIPANT_TEAM, {
    refetchQueries: [{ query: GET_TOURNAMENT_MANAGER_DATA, variables: { divisionId } }]
  });

  const [setJudgingSessionTeam] = useMutation(SET_JUDGING_SESSION_TEAM, {
    refetchQueries: [{ query: GET_TOURNAMENT_MANAGER_DATA, variables: { divisionId } }]
  });

  const handleMove = async (selectedSlot: SlotInfo | null, secondSlot: SlotInfo | null) => {
    if (!selectedSlot || !secondSlot) return;

    setError(null);
    try {
      if (selectedSlot.type === 'match' && secondSlot.type === 'match') {
        if (!secondSlot.participantId || !secondSlot.matchId) return;

        await setMatchParticipantTeam({
          variables: {
            divisionId,
            matchId: secondSlot.matchId,
            participantId: secondSlot.participantId,
            teamId: selectedSlot.team?.id || null
          }
        });

        if (selectedSlot.matchId && selectedSlot.participantId) {
          await setMatchParticipantTeam({
            variables: {
              divisionId,
              matchId: selectedSlot.matchId,
              participantId: selectedSlot.participantId,
              teamId: null
            }
          });
        }
      } else if (selectedSlot.type === 'session' && secondSlot.type === 'session') {
        if (!secondSlot.sessionId) return;

        await setJudgingSessionTeam({
          variables: {
            divisionId,
            sessionId: secondSlot.sessionId,
            teamId: selectedSlot.team?.id || null
          }
        });

        if (selectedSlot.sessionId) {
          await setJudgingSessionTeam({
            variables: {
              divisionId,
              sessionId: selectedSlot.sessionId,
              teamId: null
            }
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move team');
      throw err;
    }
  };

  const handleReplace = async (selectedSlot: SlotInfo | null, secondSlot: SlotInfo | null) => {
    if (!selectedSlot || !secondSlot) return;

    setError(null);
    try {
      if (selectedSlot.type === 'match' && secondSlot.type === 'match') {
        if (
          !selectedSlot.participantId ||
          !secondSlot.participantId ||
          !selectedSlot.matchId ||
          !secondSlot.matchId
        )
          return;

        if (selectedSlot.matchId === secondSlot.matchId) {
          await swapMatchTeams({
            variables: {
              divisionId,
              matchId: selectedSlot.matchId,
              participantId1: selectedSlot.participantId,
              participantId2: secondSlot.participantId
            }
          });
        } else {
          const team1 = selectedSlot.team;
          const team2 = secondSlot.team;

          await setMatchParticipantTeam({
            variables: {
              divisionId,
              matchId: secondSlot.matchId,
              participantId: secondSlot.participantId,
              teamId: team1?.id || null
            }
          });

          await setMatchParticipantTeam({
            variables: {
              divisionId,
              matchId: selectedSlot.matchId,
              participantId: selectedSlot.participantId,
              teamId: team2?.id || null
            }
          });
        }
      } else if (selectedSlot.type === 'session' && secondSlot.type === 'session') {
        if (!secondSlot.sessionId) return;

        if (!selectedSlot.sessionId) {
          await setJudgingSessionTeam({
            variables: {
              divisionId,
              sessionId: secondSlot.sessionId,
              teamId: selectedSlot.team?.id || null
            }
          });
        } else {
          await swapSessionTeams({
            variables: {
              divisionId,
              sessionId1: selectedSlot.sessionId,
              sessionId2: secondSlot.sessionId
            }
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to replace teams');
      throw err;
    }
  };

  const assignTeamToSlot = async (teamId: string, slot: SlotInfo) => {
    setError(null);
    try {
      if (slot.type === 'match' && slot.participantId && slot.matchId) {
        await setMatchParticipantTeam({
          variables: {
            divisionId,
            matchId: slot.matchId,
            participantId: slot.participantId,
            teamId
          }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign team');
      throw err;
    }
  };

  return {
    handleMove,
    handleReplace,
    assignTeamToSlot,
    error,
    setError
  };
}

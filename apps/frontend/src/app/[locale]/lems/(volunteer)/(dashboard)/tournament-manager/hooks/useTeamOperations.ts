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
import {
  isSlotCompleted,
  isSlotInProgress,
  isSlotBlockedAsDestination
} from '../components/validation';
import type { TournamentManagerData } from '../graphql';

const createMutationOptions = (divisionId: string) => ({
  refetchQueries: [{ query: GET_TOURNAMENT_MANAGER_DATA, variables: { divisionId } }],
  awaitRefetchQueries: true
});

export function useTeamOperations(
  divisionId: string,
  division?: TournamentManagerData['division']
) {
  const [error, setError] = useState<string | null>(null);
  const mutationOpts = createMutationOptions(divisionId);

  const [swapMatchTeams] = useMutation(SWAP_MATCH_TEAMS, mutationOpts);
  const [swapSessionTeams] = useMutation(SWAP_SESSION_TEAMS, mutationOpts);
  const [setMatchParticipantTeam] = useMutation(SET_MATCH_PARTICIPANT_TEAM, mutationOpts);
  const [setJudgingSessionTeam] = useMutation(SET_JUDGING_SESSION_TEAM, mutationOpts);

  const shouldCopyInsteadOfMove = (selectedSlot: SlotInfo | null): boolean => {
    if (!selectedSlot || !division) return false;
    return isSlotCompleted(selectedSlot, division) || isSlotInProgress(selectedSlot, division);
  };

  const handleMove = async (selectedSlot: SlotInfo | null, secondSlot: SlotInfo | null) => {
    if (!selectedSlot || !secondSlot || !division) return;
    setError(null);

    if (isSlotBlockedAsDestination(secondSlot, division)) {
      setError('Cannot move to in-progress or completed matches/sessions');
      return;
    }

    try {
      const shouldCopy = shouldCopyInsteadOfMove(selectedSlot);

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

        if (!shouldCopy && selectedSlot.matchId && selectedSlot.participantId) {
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

        if (!shouldCopy && selectedSlot.sessionId) {
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
    if (!selectedSlot || !secondSlot || !division) return;
    setError(null);

    // Prevent swapping a team with itself
    if (selectedSlot.team && secondSlot.team && selectedSlot.team.id === secondSlot.team.id) {
      setError('Cannot swap a team with itself');
      return;
    }

    if (isSlotBlockedAsDestination(secondSlot, division)) {
      setError('Cannot move to in-progress or completed matches/sessions');
      return;
    }

    try {
      const shouldCopy = shouldCopyInsteadOfMove(selectedSlot);

      if (selectedSlot.type === 'match' && secondSlot.type === 'match') {
        if (
          !selectedSlot.participantId ||
          !secondSlot.participantId ||
          !selectedSlot.matchId ||
          !secondSlot.matchId
        )
          return;

        if (shouldCopy) {
          await setMatchParticipantTeam({
            variables: {
              divisionId,
              matchId: secondSlot.matchId,
              participantId: secondSlot.participantId,
              teamId: selectedSlot.team?.id || null
            }
          });
        } else if (selectedSlot.matchId === secondSlot.matchId) {
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

          // Perform both mutations in parallel to avoid race conditions
          await Promise.all([
            setMatchParticipantTeam({
              variables: {
                divisionId,
                matchId: secondSlot.matchId,
                participantId: secondSlot.participantId,
                teamId: team1?.id || null
              }
            }),
            setMatchParticipantTeam({
              variables: {
                divisionId,
                matchId: selectedSlot.matchId,
                participantId: selectedSlot.participantId,
                teamId: team2?.id || null
              }
            })
          ]);
        }
      } else if (selectedSlot.type === 'session' && secondSlot.type === 'session') {
        if (!secondSlot.sessionId) return;

        if (shouldCopy) {
          await setJudgingSessionTeam({
            variables: {
              divisionId,
              sessionId: secondSlot.sessionId,
              teamId: selectedSlot.team?.id || null
            }
          });
        } else if (!selectedSlot.sessionId) {
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

  const clearTeam = async (selectedSlot: SlotInfo | null) => {
    if (!selectedSlot) return;
    setError(null);

    try {
      if (selectedSlot.type === 'match' && selectedSlot.matchId && selectedSlot.participantId) {
        await setMatchParticipantTeam({
          variables: {
            divisionId,
            matchId: selectedSlot.matchId,
            participantId: selectedSlot.participantId,
            teamId: null
          }
        });
      } else if (selectedSlot.type === 'session' && selectedSlot.sessionId) {
        await setJudgingSessionTeam({
          variables: {
            divisionId,
            sessionId: selectedSlot.sessionId,
            teamId: null
          }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear team');
      throw err;
    }
  };

  return {
    handleMove,
    handleReplace,
    assignTeamToSlot,
    clearTeam,
    error,
    setError
  };
}

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import {
  GET_DIVISION_TEAMS,
  TEAM_ARRIVED_MUTATION,
  TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
  type Team
} from './graphql';

export interface UsePitAdminTeamsResult {
  teams: Team[];
  loading: boolean;
  error: Error | undefined;
  markTeamArrived: (teamId: string) => Promise<void>;
}

/**
 * Custom hook for managing pit admin team arrival tracking.
 *
 * Features:
 * - Fetches initial team data from GraphQL query
 * - Subscribes to real-time team arrival updates via GraphQL subscription
 * - Server-side message recovery: automatically fetches buffered updates (Redis) if reconnected within 30 seconds
 *   - Uses lastSeenVersion to track the last event received
 *   - Server sends missed events on resubscription
 *   - Handles recovery gap: if disconnected > 30 seconds, server sends _gap marker and hook refetches initial data
 * - Optimistic UI updates for mutations with rollback on error
 * - Prevents unnecessary re-renders using Map-based state management
 *
 * @param divisionId - The division ID to track teams for
 * @returns Team data, loading state, errors, and mutation function
 */
export function usePitAdminTeams(divisionId: string): UsePitAdminTeamsResult {
  const [teams, setTeams] = useState<Team[]>([]);
  const teamsMapRef = useRef<Map<string, Team>>(new Map());
  const lastSeenVersionRef = useRef<number>(0);

  // Initial query to fetch all teams
  const {
    data: queryData,
    loading: queryLoading,
    error: queryError,
    refetch: refetchTeams
  } = useQuery(GET_DIVISION_TEAMS, {
    variables: { divisionId },
    fetchPolicy: 'network-only'
  });

  // Initialize teams map when query data arrives
  useEffect(() => {
    if (queryData?.division?.teams) {
      const newMap = new Map<string, Team>();
      queryData.division.teams.forEach((team: Team) => {
        newMap.set(team.id, team);
      });
      teamsMapRef.current = newMap;
      setTeams(Array.from(newMap.values()));
    }
  }, [queryData]);

  // Subscribe to team arrival updates with server-side message recovery via Redis
  const { error: subscriptionError, data: subscriptionData } = useSubscription(
    TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    {
      variables: {
        divisionId,
        lastSeenVersion: lastSeenVersionRef.current
      },
      shouldResubscribe: true
    }
  );

  // Process subscription updates and handle recovery gaps
  useEffect(() => {
    if (subscriptionData?.teamArrivalUpdated) {
      const updatedTeam = subscriptionData.teamArrivalUpdated;

      // Check if this is a gap marker (recovery buffer exceeded, client was offline > 30 seconds)
      if ((updatedTeam as unknown as Record<string, unknown>)._gap === true) {
        console.warn('[PitAdmin] Recovery gap detected - refetching initial data');
        // Refetch initial data since we missed too many updates
        refetchTeams().catch(error => {
          console.error('[PitAdmin] Failed to refetch teams after recovery gap:', error);
        });
        return;
      }

      // Update the team in our map
      teamsMapRef.current.set(updatedTeam.id, updatedTeam);

      // Update state with new array to trigger re-render
      setTeams(Array.from(teamsMapRef.current.values()));
    }
  }, [subscriptionData, refetchTeams]);

  // Mutation to mark a team as arrived
  const [teamArrivedMutation] = useMutation(TEAM_ARRIVED_MUTATION);

  const markTeamArrived = async (teamId: string) => {
    const currentTeam = teamsMapRef.current.get(teamId);
    if (!currentTeam) {
      console.error('Team not found:', teamId);
      return;
    }

    // Save previous state for potential rollback
    const previousTeam = { ...currentTeam };

    // Optimistically update the UI
    const optimisticTeam: Team = { ...currentTeam, arrived: true };
    teamsMapRef.current.set(teamId, optimisticTeam);
    setTeams(Array.from(teamsMapRef.current.values()));

    try {
      // Execute mutation
      await teamArrivedMutation({
        variables: { teamId, divisionId }
      });
    } catch (error) {
      // Revert optimistic update on error
      teamsMapRef.current.set(teamId, previousTeam);
      setTeams(Array.from(teamsMapRef.current.values()));
      console.error('Failed to mark team as arrived:', error);
    }
  };

  return {
    teams,
    loading: queryLoading && teams.length === 0,
    error: queryError || subscriptionError,
    markTeamArrived
  };
}

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
  connected: boolean;
  markTeamArrived: (teamId: string) => Promise<void>;
}

/**
 * Custom hook for managing pit admin team arrival tracking.
 *
 * Features:
 * - Fetches initial team data with cache-and-network policy
 * - Subscribes to real-time team arrival updates
 * - Handles optimistic UI updates for mutations
 * - Automatic recovery on reconnection (subscription resumes automatically)
 * - Connection status tracking
 * - Prevents React render loops by carefully managing state updates
 *
 * @param divisionId - The division ID to track teams for
 * @returns Team data, loading state, errors, connection status, and mutation function
 */
export function usePitAdminTeams(divisionId: string): UsePitAdminTeamsResult {
  const [teams, setTeams] = useState<Team[]>([]);
  const [connected, setConnected] = useState(true);
  const teamsMapRef = useRef<Map<string, Team>>(new Map());

  // Initial query to fetch all teams
  const {
    data: queryData,
    loading: queryLoading,
    error: queryError
  } = useQuery(GET_DIVISION_TEAMS, {
    variables: { divisionId },
    fetchPolicy: 'cache-and-network'
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

  // Subscribe to team arrival updates
  const { error: subscriptionError } = useSubscription(TEAM_ARRIVAL_UPDATED_SUBSCRIPTION, {
    variables: { divisionId },
    onData: ({ data }) => {
      if (data.data?.teamArrivalUpdated) {
        const updatedTeam = data.data.teamArrivalUpdated;

        // Update the team in our map
        teamsMapRef.current.set(updatedTeam.id, updatedTeam);

        // Update state with new array to trigger re-render
        setTeams(Array.from(teamsMapRef.current.values()));
      }
    },
    onComplete: () => {
      setConnected(false);
    },
    onError: () => {
      setConnected(false);
    },
    // Subscription automatically reconnects via graphql-ws client configuration
    shouldResubscribe: true
  });

  // Track connection status based on subscription state
  useEffect(() => {
    if (!subscriptionError) {
      setConnected(true);
    }
  }, [subscriptionError]);

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
    connected,
    markTeamArrived
  };
}

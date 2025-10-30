/**
 * Example: How to use the GraphQL WebSocket library
 *
 * This file demonstrates the complete usage of the LEMS real-time networking framework
 *
 * Key points:
 * - Uses apiFetch (from @lems/shared) for initial data fetching and mutations
 * - WebSocket for real-time subscriptions only
 * - Mutations use HTTP (not WebSocket) as they're one-time operations
 * - Zod for type-safe data validation
 * - Automatic revalidation on reconnect/focus
 */

import { z } from 'zod';
import { useGraphQLSubscription, useGraphQLMutation } from './index';

// 1. Define your data schema with Zod
const TeamSchema = z.object({
  id: z.string(),
  number: z.string(),
  name: z.string(),
  arrived: z.boolean()
});

const DivisionDataSchema = z.object({
  division: z.object({
    teams: z.array(TeamSchema)
  })
});

type DivisionData = z.infer<typeof DivisionDataSchema>;

// 2. Define your GraphQL queries, subscriptions, and mutations
const QUERY = `
  query GetDivision($divisionId: String!) {
    division(id: $divisionId) {
      teams {
        id
        number
        name
        arrived
      }
    }
  }
`;

const SUBSCRIPTION = `
  subscription TeamArrivalUpdated {
    teamArrivalUpdated {
      teamId
      divisionId
      arrived
      updatedAt
    }
  }
`;

const MUTATION = `
  mutation UpdateTeamArrival($teamId: String!, $arrived: Boolean!) {
    updateTeamArrival(teamId: $teamId, arrived: $arrived) {
      teamId
      divisionId
      arrived
      updatedAt
    }
  }
`;

// 3. Use in your component
export function ExampleComponent({ divisionId }: { divisionId: string }) {
  // Subscribe to data with real-time updates
  const { data, error, isLoading, revalidate } = useGraphQLSubscription<DivisionData>({
    subscription: SUBSCRIPTION,
    initialQuery: QUERY,
    initialQueryVariables: { divisionId },
    schema: DivisionDataSchema,
    onUpdate: (currentData, update) => {
      if (!currentData) {
        return { division: { teams: [] } };
      }

      // Type-safe update handling
      const validatedUpdate = z
        .object({
          teamArrivalUpdated: z.object({
            teamId: z.string(),
            arrived: z.boolean()
          })
        })
        .parse(update);

      return {
        division: {
          teams: currentData.division.teams.map(team =>
            team.id === validatedUpdate.teamArrivalUpdated.teamId
              ? { ...team, arrived: validatedUpdate.teamArrivalUpdated.arrived }
              : team
          )
        }
      };
    },
    revalidateOnFocus: true, // Revalidate when tab gains focus
    revalidateOnReconnect: true // Revalidate after reconnection
  });

  // Mutation to update data (uses HTTP, not WebSocket)
  const { mutate: updateArrival, isLoading: isUpdating } = useGraphQLMutation({
    mutation: MUTATION,
    onSuccess: data => {
      console.log('Update successful:', data);
    },
    onError: error => {
      console.error('Update failed:', error);
    }
  });

  const handleUpdate = async (teamId: string) => {
    await updateArrival({ teamId, arrived: true });
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Teams ({data?.division.teams.length || 0})</h1>
      <button onClick={revalidate} disabled={isUpdating}>
        Refresh
      </button>
      <ul>
        {data?.division.teams.map(team => (
          <li key={team.id}>
            {team.number} - {team.name} - {team.arrived ? '✓' : '✗'}
            <button onClick={() => handleUpdate(team.id)} disabled={isUpdating}>
              Mark Arrived
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

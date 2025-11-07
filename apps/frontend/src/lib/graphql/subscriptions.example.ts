/**
 * Example GraphQL Subscriptions for LEMS Frontend
 *
 * This file demonstrates how to use subscriptions with the Apollo Client.
 *
 * To use subscriptions in React components:
 *
 * 1. Import the `useSubscription` hook from `@apollo/client`
 * 2. Define your subscription with `gql`
 * 3. Call `useSubscription` with the subscription document
 *
 * Example:
 *
 * ```typescript
 * import { gql, useSubscription } from '@apollo/client';
 *
 * const TEAM_UPDATED_SUBSCRIPTION = gql`
 *   subscription OnTeamUpdated($teamId: String!) {
 *     teamUpdated(teamId: $teamId) {
 *       id
 *       name
 *       checkedInCount
 *     }
 *   }
 * `;
 *
 * export function TeamUpdatesListener({ teamId }: { teamId: string }) {
 *   const { data, loading, error } = useSubscription(TEAM_UPDATED_SUBSCRIPTION, {
 *     variables: { teamId }
 *   });
 *
 *   if (loading) return <p>Listening for updates...</p>;
 *   if (error) return <p>Error: {error.message}</p>;
 *
 *   return (
 *     <div>
 *       <p>Team: {data.teamUpdated.name}</p>
 *       <p>Checked in: {data.teamUpdated.checkedInCount}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * Also see the React documentation for `useSubscription`:
 * https://www.apollographql.com/docs/react/api/react/useSubscription
 *
 * And see `subscribeToMore` for adding subscription updates to an existing query:
 * https://www.apollographql.com/docs/react/data/subscriptions/#subscribing-to-updates-for-a-query
 */

export {}; // Empty export to make this a module

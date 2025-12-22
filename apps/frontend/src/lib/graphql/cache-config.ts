import { InMemoryCache } from '@apollo/client-integration-nextjs';

/**
 * Shared Apollo Client cache configuration
 * Used by both SSR and client-side Apollo clients to ensure cache consistency
 */
export function createApolloCache() {
  return new InMemoryCache({
    typePolicies: {
      Event: { keyFields: ['id'] },
      Division: { keyFields: ['id'] },
      Team: { keyFields: ['id'] },
      RootTeam: { keyFields: ['id'] },
      Volunteer: {
        // Use id when available, otherwise don't normalize
        keyFields: object => (object.id ? ['id'] : false)
      },
      Table: { keyFields: ['id'] },
      Room: { keyFields: ['id'] },
      Rubric: { keyFields: ['id'] },
      Judging: { keyFields: ['divisionId'] },
      Field: { keyFields: ['divisionId'] },
      MatchParticipant: { keyFields: ['tableId', 'matchId'] }
    }
  });
}

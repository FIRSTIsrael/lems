import type { Server } from 'http';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import type { Disposable } from 'graphql-ws';
import { loadLemsGraphQLSchema } from '@lems/types/api/lems/graphql';
import { resolvers } from './resolvers';

export const typeDefs = loadLemsGraphQLSchema();
export const schema = makeExecutableSchema({ typeDefs, resolvers });

/**
 * GraphQL context object available to all resolvers.
 * Used for dependency injection (auth, dataloaders, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GraphQLContext {
  // Add context properties here (e.g., user, dataloaders, etc.)
  // user?: User;
}

/**
 * Creates and configures an Apollo Server instance.
 *
 * @param httpServer - The HTTP server instance to gracefully drain on shutdown
 * @param wsServerCleanup - The WebSocket server cleanup function from graphql-ws
 * @returns Configured Apollo Server instance ready for middleware integration
 *
 * Features:
 * - Graceful shutdown via HTTP server drain plugin
 * - WebSocket support for subscriptions (via graphql-ws integration)
 * - Introspection enabled in development (Apollo Sandbox, GraphQL Playground)
 * - Type-safe context for all resolvers
 */
export function createApolloServer(httpServer: Server, wsServerCleanup: Disposable) {
  console.log('[Apollo] Creating Apollo Server instance');

  return new ApolloServer<GraphQLContext>({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),

      {
        async serverWillStart() {
          console.log('[Apollo] Server starting');
          return {
            async drainServer() {
              console.log('[Apollo] Draining server');
              await wsServerCleanup.dispose();
            }
          };
        }
      }
    ],
    introspection: process.env.NODE_ENV !== 'production'
  });
}

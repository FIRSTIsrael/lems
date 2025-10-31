import type { Server } from 'http';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GraphQLContext {
  // Add context properties here (e.g., user, dataloaders, etc.)
  // user?: User;
}

export function createApolloServer(httpServer: Server) {
  return new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    plugins: [
      // Proper shutdown for the HTTP server
      ApolloServerPluginDrainHttpServer({ httpServer })

      // Additional plugins can be added here
    ],
    // Enable introspection and playground in development
    introspection: process.env.NODE_ENV !== 'production'
  });
}

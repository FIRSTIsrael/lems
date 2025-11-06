import type { Server } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { schema } from './apollo-server';
import type { GraphQLContext } from './apollo-server';

/**
 * Creates and configures a WebSocket server for GraphQL subscriptions
 *
 * @param httpServer - The HTTP server instance to attach the WebSocket server to
 * @param path - The path to use for WebSocket connections (default: '/subscriptions')
 * @returns A cleanup function to gracefully dispose of the WebSocket server
 *
 * Features:
 * - Uses graphql-ws protocol for subscriptions
 * - Attaches to existing HTTP server
 * - Provides proper cleanup on server shutdown
 * - Can be extended with authentication via onConnect
 */
export function createWebSocketServer(
  httpServer: Server,
  path = '/subscriptions'
): () => Promise<void> {
  const wsServer = new WebSocketServer({ server: httpServer, path });

  // Set up graphql-ws to handle WebSocket connections
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const serverCleanup = useServer(
    {
      schema,
      // Context function - can be used to add authentication, user info, etc.
      context: async (/* ctx, msg, args */): Promise<GraphQLContext> => {
        // TODO: Extract user from ctx.connectionParams or headers
        // const user = await authenticate(ctx.connectionParams);
        return {
          // user,
        };
      }
      // Optional: Handle client connections
      // onConnect: async (ctx) => {
      //   // Validate authentication token, etc.
      //   // Return false to reject the connection
      //   return true;
      // },
      // Optional: Handle client disconnections
      // onDisconnect: (ctx, code, reason) => {
      //   console.log('Client disconnected');
      // }
    },
    wsServer
  );

  return async () => {
    await serverCleanup.dispose();
  };
}

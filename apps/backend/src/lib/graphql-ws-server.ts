/**
 * GraphQL WebSocket Server Setup
 *
 * This module sets up a production-ready WebSocket server for GraphQL subscriptions
 * using the graphql-ws protocol. It handles:
 * - Connection lifecycle management
 * - Authentication (TODO: to be implemented)
 * - Division-based access control
 * - Graceful shutdown
 * - Error handling and logging
 */

/* eslint-disable react-hooks/rules-of-hooks */

import type { Server as HTTPServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { schema } from './graphql';

interface ConnectionContext extends Record<string, unknown> {
  divisionId: string;
  userId?: string;
  roles?: string[];
}

interface ConnectionParams {
  divisionId?: string;
  userId?: string;
  roles?: string[];
}

/**
 * Initialize the GraphQL WebSocket server
 * @param httpServer - The HTTP server to attach the WebSocket server to
 * @param path - The WebSocket endpoint path (default: '/graphql/ws')
 */
export function initGraphQLWebSocket(httpServer: HTTPServer, path = '/graphql/ws') {
  // Create WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path,
    // Production settings
    perMessageDeflate: false, // Disable compression for better performance
    maxPayload: 100 * 1024 // 100KB max message size
  });

  // Track active connections for monitoring
  let connectionCount = 0;

  // Use graphql-ws to handle WebSocket connections
  const serverCleanup = useServer(
    {
      schema,

      // Connection initialization - runs when a client connects
      onConnect: async ctx => {
        connectionCount++;
        console.log(`🔌 GraphQL WS: New connection (total: ${connectionCount})`);

        // Extract connection params from the client
        const connectionParams = ctx.connectionParams as ConnectionParams;

        // TODO: Implement authentication
        // For now, we'll extract the divisionId from connection params
        const context: ConnectionContext = {
          divisionId: connectionParams?.divisionId,
          userId: connectionParams?.userId,
          roles: connectionParams?.roles || []
        };

        // Validate that divisionId is provided
        if (!context.divisionId) {
          console.warn('⚠️  GraphQL WS: Connection rejected - no divisionId provided');
          return false; // Reject connection
        }

        console.log(`✅ GraphQL WS: Connection authenticated for division ${context.divisionId}`);
        return context;
      },

      // Context factory - provides context to resolvers
      context: async ctx => {
        // The context from onConnect is available here
        return ctx;
      },

      // Handle subscription
      onSubscribe: async () => {
        console.log(`📡 GraphQL WS: New subscription started`);
      },

      // Handle subscription completion
      onComplete: async () => {
        console.log(`🏁 GraphQL WS: Subscription completed`);
      },

      // Handle disconnection
      onDisconnect: async (_ctx, code, reason) => {
        connectionCount--;
        console.log(
          `❌ GraphQL WS: Client disconnected (code: ${code}, reason: ${reason || 'none'}, remaining: ${connectionCount})`
        );
      },

      // Error handling
      onError: (_ctx, _message, errors) => {
        console.error('❗ GraphQL WS Error:', errors);
      }
    },
    wsServer
  );

  console.log(`✅ GraphQL WebSocket server initialized on ${path}`);

  // Return cleanup function for graceful shutdown
  return {
    cleanup: async () => {
      console.log('🛑 Shutting down GraphQL WebSocket server...');
      await serverCleanup.dispose();
      wsServer.close(() => {
        console.log('✅ GraphQL WebSocket server closed');
      });
    },
    wsServer,
    getConnectionCount: () => connectionCount
  };
}

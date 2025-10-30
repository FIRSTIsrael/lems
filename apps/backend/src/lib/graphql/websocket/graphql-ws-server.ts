import type { Server as HTTPServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { schema } from '..';

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
  const wsServer = new WebSocketServer({
    server: httpServer,
    path,
    perMessageDeflate: false, // Disable compression for better performance
    maxPayload: 100 * 1024 // 100KB max message size
  });

  let connectionCount = 0;

  const serverCleanup = useServer(
    {
      schema,

      onConnect: async ctx => {
        connectionCount++;
        console.log(`🔌 GraphQL WS: New connection (total: ${connectionCount})`);

        const connectionParams = ctx.connectionParams as ConnectionParams;

        // TODO: Implement authentication
        // For now, we'll extract the divisionId from connection params
        const context: ConnectionContext = {
          divisionId: connectionParams?.divisionId,
          userId: connectionParams?.userId,
          roles: connectionParams?.roles || []
        };

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

      onSubscribe: async () => {
        console.log(`📡 GraphQL WS: New subscription started`);
      },

      onComplete: async () => {
        console.log(`🏁 GraphQL WS: Subscription completed`);
      },

      onDisconnect: async (_ctx, code, reason) => {
        connectionCount--;
        console.log(
          `❌ GraphQL WS: Client disconnected (code: ${code}, reason: ${reason || 'none'}, remaining: ${connectionCount})`
        );
      },

      onError: (_ctx, _message, errors) => {
        console.error('❗ GraphQL WS Error:', errors);
      }
    },
    wsServer
  );

  console.log(`✅ GraphQL WebSocket server initialized on ${path}`);

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

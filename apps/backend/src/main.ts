import * as http from 'http';
import * as path from 'path';
import express from 'express';
import morgan from 'morgan';
import favicon from 'serve-favicon';
import cookies from 'cookie-parser';
import cors from 'cors';
import { expressMiddleware } from '@as-integrations/express5';
import timesyncServer from 'timesync/server';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import './lib/dayjs';
import './lib/database';
import { logger } from './lib/logger';
import { createApolloServer, type GraphQLContext, schema } from './lib/graphql/apollo-server';
import { authenticateHttp, authenticateWebsocket } from './lib/graphql/auth-context';
import { getRedisClient, closeRedisClient } from './lib/redis/redis-client';
import { shutdownRedisPubSub } from './lib/redis/redis-pubsub';
import { getWorkerManager } from './lib/queues/worker-manager';
import { handleSessionCompleted } from './lib/queues/handlers/session-completed';
import { handleMatchCompleted } from './lib/queues/handlers/match-completed';
import { handleMatchEndgameTriggered } from './lib/queues/handlers/match-endgame-triggered';
import lemsRouter from './routers/lems';
import adminRouter from './routers/admin/index';
import portalRouter from './routers/portal';
import schedulerRouter from './routers/scheduler/index';
import exportRouter from './routers/api/export/index';

logger.info({ component: 'server' }, 'Backend server initializing');

const app = express();
const server = http.createServer(app);

app.use(cookies());
app.use(morgan('tiny'));

const corsOptions = {
  origin: [/localhost:\d+$/, /\.firstisrael\.org.il$/],
  credentials: true
};
app.use(cors(corsOptions));

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));

app.use('/timesync', timesyncServer.requestHandler);

app.use(express.json());

// Redis: Initialize connection on startup
try {
  const redis = getRedisClient();
  await redis.ping();
  logger.info({ component: 'redis' }, 'Redis initialized and connection verified');
} catch (error) {
  logger.error({ component: 'redis', error: error instanceof Error ? error.message : String(error) }, 'Failed to initialize Redis');
  throw new Error('Redis initialization failed');
}

// Worker Manager: Initialize and register event handlers
try {
  const workerManager = getWorkerManager();

  // Register session completion handler
  workerManager.registerHandler('session-completed', handleSessionCompleted);

  // Register match completion handler
  workerManager.registerHandler('match-completed', handleMatchCompleted);

  // Register match endgame triggered handler
  workerManager.registerHandler('match-endgame-triggered', handleMatchEndgameTriggered);

  // Start the unified worker
  await workerManager.start();
  logger.info({ component: 'worker-manager', handlers: ['session-completed', 'match-completed', 'match-endgame-triggered'] }, 'Worker manager started with event handlers');
} catch (error) {
  logger.error({ component: 'worker-manager', error: error instanceof Error ? error.message : String(error) }, 'Failed to initialize worker manager');
  throw new Error('Worker manager initialization failed');
}

// WebSocket: Create WebSocket server for subscriptions
logger.info({ component: 'websocket', path: '/lems/graphql' }, 'Creating WebSocket server');
const wsServer = new WebSocketServer({
  server,
  path: '/lems/graphql'
});

// eslint-disable-next-line react-hooks/rules-of-hooks
const serverCleanup = useServer(
  {
    schema,
    context: async (ctx): Promise<GraphQLContext> => {
      const user = await authenticateWebsocket(ctx.connectionParams);
      return { user };
    },
    onConnect: async () => {
      logger.info({ component: 'websocket' }, 'Client connected');
      return true;
    },
    onDisconnect: () => {
      logger.info({ component: 'websocket' }, 'Client disconnected');
    },
    onError: (ctx, message, errors) => {
      logger.error({ component: 'websocket', message, errors }, 'GraphQL WebSocket error');
    }
  },
  wsServer
);
logger.info({ component: 'websocket' }, 'WebSocket server initialized for subscriptions');

// GraphQL: Initialize Apollo Server and register middleware
// This must be registered before the routers to ensure /lems/graphql
// takes precedence over /lems/* routes
const apolloServer = createApolloServer(server, serverCleanup);
await apolloServer.start();
logger.info({ component: 'graphql' }, 'Apollo Server initialized');

app.use(
  '/lems/graphql',
  expressMiddleware(apolloServer, {
    context: async ({ req }): Promise<GraphQLContext> => {
      const user = await authenticateHttp(req);
      return { user };
    }
  })
);

// Application routers
app.use('/lems', lemsRouter);
app.use('/admin', adminRouter);
app.use('/scheduler', schedulerRouter);
app.use('/portal', portalRouter);
app.use('/api/export', exportRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.use((req, res) => {
  logger.warn({ component: 'http', method: req.method, path: req.path }, 'Route not found');
  res.status(404).json({ error: 'ROUTE_NOT_DEFINED' });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  logger.error({
    component: 'http',
    method: req.method,
    path: req.path,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined
  }, 'Unhandled error');
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});

logger.info('Starting server...');
const port = 3333;
server.listen(port, () => {
  logger.info({ port }, 'Server started on port');
  logger.info({ endpoint: `http://localhost:${port}/lems/graphql` }, 'GraphQL endpoint');
});

server.on('error', (error) => {
  logger.error({ component: 'server', error: error.message }, 'Server error');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info({ component: 'server', signal: 'SIGTERM' }, 'SIGTERM received, shutting down gracefully');
  server.close(async () => {
    const workerManager = getWorkerManager();
    await workerManager.stop();
    await shutdownRedisPubSub();
    await closeRedisClient();
    logger.info({ component: 'server' }, 'Graceful shutdown complete');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info({ component: 'server', signal: 'SIGINT' }, 'SIGINT received, shutting down gracefully');
  server.close(async () => {
    const workerManager = getWorkerManager();
    await workerManager.stop();
    await shutdownRedisPubSub();
    await closeRedisClient();
    logger.info({ component: 'server' }, 'Graceful shutdown complete');
    process.exit(0);
  });
});

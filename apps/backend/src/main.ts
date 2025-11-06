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
import { createApolloServer, schema, type GraphQLContext } from './lib/graphql/apollo-server';
import { getRedisClient, closeRedisClient } from './lib/redis/redis-client';
import lemsRouter from './routers/lems';
import adminRouter from './routers/admin/index';
import portalRouter from './routers/portal';
import schedulerRouter from './routers/scheduler/index';

const app = express();
const server = http.createServer(app);

app.use(cookies());
app.use(morgan('combined'));

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
  console.log('✅ Redis initialized and connection verified');
} catch (error) {
  console.error('⚠️ Failed to initialize Redis:', error);
  throw new Error('Redis initialization failed');
}

// WebSocket: Create WebSocket server for subscriptions
const wsServer = new WebSocketServer({
  server,
  path: '/lems/graphql'
});

// GraphQL: Initialize Apollo Server and register middleware
// eslint-disable-next-line react-hooks/rules-of-hooks
const serverCleanup = useServer({ schema }, wsServer);
console.log('✅ WebSocket server initialized for subscriptions');

// This must be registered before the routers to ensure /lems/graphql
// takes precedence over /lems/* routes
const apolloServer = createApolloServer(server, serverCleanup);
await apolloServer.start();
console.log('✅ Apollo Server initialized');

app.use(
  '/lems/graphql',
  expressMiddleware(apolloServer, {
    context: async (/* { req } */): Promise<GraphQLContext> => {
      // TODO: Extract user from req.cookies or headers
      // const user = await authenticate(req);
      return {
        // user,
      };
    }
  })
);

// Application routers
app.use('/lems', lemsRouter);
app.use('/admin', adminRouter);
app.use('/scheduler', schedulerRouter);
app.use('/portal', portalRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({ error: 'ROUTE_NOT_DEFINED' });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});

console.log('💫 Starting server...');
const port = 3333;
server.listen(port, () => {
  console.log(`✅ Server started on port ${port}.`);
  console.log(`🚀 GraphQL endpoint: http://localhost:${port}/lems/graphql`);
});

server.on('error', console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await closeRedisClient();
    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await closeRedisClient();
    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  });
});

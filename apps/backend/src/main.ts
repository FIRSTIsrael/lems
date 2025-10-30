import * as http from 'http';
import * as path from 'path';
import express from 'express';
import favicon from 'serve-favicon';
import cookies from 'cookie-parser';
import cors from 'cors';
import timesyncServer from 'timesync/server';
import './lib/dayjs';
import './lib/database';
import lemsRouter from './routers/lems';
import adminRouter from './routers/admin/index';
import portalRouter from './routers/portal';
import schedulerRouter from './routers/scheduler/index';
import { initGraphQLWebSocket } from './lib/graphql/websocket/graphql-ws-server';

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: [/localhost:\d+$/, /\.firstisrael\.org.il$/],
  credentials: true
};

app.use(cookies());
app.use(cors(corsOptions));

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));

app.use('/timesync', timesyncServer.requestHandler);

app.use(express.json());

// TODO: new logger
// app.use('/', expressLogger);

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});

// Initialize GraphQL WebSocket server
const graphqlWs = initGraphQLWebSocket(server, '/lems/graphql/ws');

console.log('💫 Starting server...');
const port = 3333;
server.listen(port, () => {
  console.log(`✅ Server started on port ${port}.`);
  console.log(`   - HTTP/REST: http://localhost:${port}`);
  console.log(`   - GraphQL: http://localhost:${port}/lems/graphql`);
  console.log(`   - GraphQL WebSocket: ws://localhost:${port}/lems/graphql/ws`);
});

server.on('error', console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await graphqlWs.cleanup();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await graphqlWs.cleanup();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

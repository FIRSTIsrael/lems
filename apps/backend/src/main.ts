import * as http from 'http';
import * as path from 'path';
import express from 'express';
import favicon from 'serve-favicon';
import cookies from 'cookie-parser';
import cors from 'cors';
import { expressMiddleware } from '@as-integrations/express5';
import timesyncServer from 'timesync/server';
import './lib/dayjs';
import './lib/database';
import { createApolloServer, type GraphQLContext } from './lib/graphql/apollo-server';
import lemsRouter from './routers/lems';
import adminRouter from './routers/admin/index';
import portalRouter from './routers/portal';
import schedulerRouter from './routers/scheduler/index';

const app = express();
const server = http.createServer(app);

app.use(cookies());

const corsOptions = {
  origin: [/localhost:\d+$/, /\.firstisrael\.org.il$/],
  credentials: true
};
app.use(cors(corsOptions));

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));

app.use('/timesync', timesyncServer.requestHandler);

app.use(express.json());

// GraphQL: Initialize Apollo Server and register middleware
// This must be registered before the routers to ensure /lems/graphql
// takes precedence over /lems/* routes
const apolloServer = createApolloServer(server);
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

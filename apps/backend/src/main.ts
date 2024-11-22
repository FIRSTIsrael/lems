import express from 'express';
import favicon from 'serve-favicon';
import cookies from 'cookie-parser';
import cors from 'cors';
import * as http from 'http';
import * as path from 'path';
import { Server } from 'socket.io';
import timesyncServer from 'timesync/server';
import './lib/dayjs';
import { expressLogger } from './lib/logger';
import apiRouter from './routers/api/index';
import authRouter from './routers/auth';
import publicRouter from './routers/public/index';
import dashboardRouter from './routers/dashboard/index';
import websocket from './websocket/index';
import wsAuth from './middlewares/websocket/auth';
import wsValidateDivision from './middlewares/websocket/division-validator';

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: [/localhost:\d+$/, /\.firstisrael\.org.il$/],
  credentials: true
};
const io = new Server(server, { cors: corsOptions });

app.use(cookies());
app.use(cors(corsOptions));

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));

app.use('/timesync', timesyncServer.requestHandler);

app.use(express.json());
app.use('/', expressLogger);

app.use('/auth', authRouter);
app.use('/public', publicRouter);
app.use('/dashboard', dashboardRouter);
app.use('/api', apiRouter);

app.get('/status', (req, res) => {
  return res.status(200).json({ ok: true });
});

app.use((req, res) => res.status(404).json({ error: 'ROUTE_NOT_DEFINED' }));

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});

const namespace = io.of(/^\/division\/\w+$/);
namespace.use(wsAuth);
namespace.use(wsValidateDivision);
namespace.on('connection', websocket);

console.log('💫 Starting server...');
const port = 3333;
server.listen(port, () => {
  console.log(`✅ Server started on port ${port}.`);
});

server.on('error', console.error);

import express from 'express';
import favicon from 'serve-favicon';
import cookies from 'cookie-parser';
import cors from 'cors';
import * as http from 'http';
import * as path from 'path';
import { Server } from 'socket.io';
import { expressLogger } from './lib/logger';
import apiRouter from './routers/api/index';
import authRouter from './routers/auth';
import publicRouter from './routers/public/index';
import judgingSocket from './websocket/judging';
import fieldSocket from './websocket/field';
import { wsAuth } from './middlewares/auth';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cookies());

const corsOptions = {
  origin: ['http://localhost:4200', /\.firstisrael\.org.il$/],
  credentials: true
};
app.use(cors(corsOptions));

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));

app.use(express.json());
app.use('/', expressLogger);

app.use('/auth', authRouter);
app.use('/public', publicRouter);
app.use('/api', apiRouter);

app.get('/status', (req, res) => {
  return res.status(200).json({ ok: true });
});

app.use((req, res) => res.status(404).json({ error: 'ROUTE_NOT_DEFINED' }));

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});

const judgingNamespace = io.of('/judging');
judgingNamespace.use(wsAuth);
judgingNamespace.on('connection', judgingSocket);

io.of('/field').on('connection', fieldSocket);

console.log('💫 Starting server...');
const port = process.env.BACKEND_PORT || 3333;
server.listen(port, () => {
  console.log(`✅ Server started on port ${port}.`);
});

server.on('error', console.error);

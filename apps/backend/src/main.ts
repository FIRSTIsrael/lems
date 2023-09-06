import express from 'express';
import favicon from 'serve-favicon';
import * as http from 'http';
import * as path from 'path';
import * as WebSocket from 'ws';
import { expressLogger } from './lib/logger';
import apiRouter from './routers/api';
import authRouter from './routers/auth';
import { wsAuth } from './middlewares/auth';
import { User } from '@lems/types';

const app = express();
const server = http.createServer(app);
const wsServer = new WebSocket.Server({ noServer: true });

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));

app.use(express.json());
app.use('/', expressLogger);

app.use('/auth', authRouter);
app.use('/api', apiRouter);

app.use((req, res) => res.status(404).json({ error: 'ROUTE_NOT_DEFINED' }));

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});

server.on('upgrade', async (req, socket, head) => {
  socket.on('error', err => console.error(err));

  wsAuth(req, (err: string, user: User) => {
    if (err || !user) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    socket.removeListener('error', err => console.error(err));

    wsServer.handleUpgrade(req, socket, head, ws => {
      wsServer.emit('connection', ws, req, user);
    });
  });
});

wsServer.on('connection', (ws: WebSocket) => {
  ws.on('message', (message: string) => {
    //TODO: delete this boilerplate, replace with routes later based on message contents
    console.log('received: %s', message);

    if (message.toString().startsWith('broadcast: ')) {
      wsServer.clients.forEach(client => {
        client.send(`Hello, broadcast message -> ${message}`);
      });
    } else {
      ws.send(`Hello, you sent -> ${message}`);
    }
  });

  //TODO: we can handle broken WS connections if needed

  // Immediately sends upon connection
  ws.send('Connected to WebSocket server');
});

console.log('💫 Starting server...');
const port = process.env.BACKEND_PORT || 3333;
server.listen(port, () => {
  console.log(`✅ Server started on port ${port}.`);
});

server.on('error', console.error);

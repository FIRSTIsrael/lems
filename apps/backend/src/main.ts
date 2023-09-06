import express from 'express';
import * as http from 'http';
import * as path from 'path';
import * as WebSocket from 'ws';
import { expressLogger } from './lib/logger';
import apiRouter from './routers/api';
import loginRouter from './routers/login';

const app = express();
const server = http.createServer(app);
const wsServer = new WebSocket.Server({ server });

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.json());
app.use('/', expressLogger);

app.use('/login', loginRouter);
app.use('/api', apiRouter);

app.use((req, res) => res.status(404).json({ error: 'ROUTE_NOT_DEFINED' }));

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});

wsServer.on('connection', (ws: WebSocket) => {
  //TODO: move boilerplate code into separate functions
  ws.on('message', (message: string) => {
    console.log('received: %s', message);
    if (message.toString().startsWith('broadcast: ')) {
      wsServer.clients.forEach((client) => {
        client.send(`Hello, broadcast message -> ${message}`);
      });
    } else {
      ws.send(`Hello, you sent -> ${message}`);
    }
  });

  //TODO: we can handle broken WS connections if needed

  // Immediately sends upon connection
  ws.send('Hi there, I am a WebSocket server');
});

console.log('💫 Starting server...');
const port = process.env.BACKEND_PORT || 3333;
server.listen(port, () => {
  console.log(`✅ Server started on port ${port}.`);
});

server.on('error', console.error);

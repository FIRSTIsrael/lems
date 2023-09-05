import express from 'express';
import * as http from 'http';
import * as path from 'path';
import * as WebSocket from 'ws';

const app = express();
const server = http.createServer(app);
const wsServer = new WebSocket.Server({ server });

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
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

const port = process.env.PORT || 3333;
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);

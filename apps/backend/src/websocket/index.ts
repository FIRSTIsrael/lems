import { Socket } from 'socket.io';
import {
  WSServerEmittedEvents,
  WSClientEmittedEvents,
  WSInterServerEvents,
  WSSocketData
} from '@lems/types';
import { handleStartSession, handleAbortSession } from './handlers/judging-session';

const websocket = (
  socket: Socket<WSClientEmittedEvents, WSServerEmittedEvents, WSInterServerEvents, WSSocketData>
) => {
  const namespace = socket.nsp;
  const eventId = socket.nsp.name.split('/')[2];

  console.log(`🔌WS: Connection to event ${eventId}`);

  socket.on('joinRoom', (room, callback) => {
    console.log(`🏠 WS: Joining room ${room}`);
    socket.join(room);
    callback({ ok: true });
  });

  socket.on('startJudgingSession', (...args) => handleStartSession(namespace, ...args));

  socket.on('abortJudgingSession', (...args) => handleAbortSession(namespace, ...args));

  socket.on('disconnect', () => {
    console.log(`❌WS: Disconnection from event ${eventId}`);
  });
};

export default websocket;

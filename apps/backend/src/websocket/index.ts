import { Socket } from 'socket.io';
import {
  WSServerEmittedEvents,
  WSClientEmittedEvents,
  WSInterServerEvents,
  WSSocketData
} from '@lems/types';
import { handleStartSession, handleAbortSession, handleUpdateRubric } from './handlers/judging';
import { handleRegisterTeam, handleCreateTicket, handleUpdateTicket } from './handlers/pit-admin';

const websocket = (
  socket: Socket<WSClientEmittedEvents, WSServerEmittedEvents, WSInterServerEvents, WSSocketData>
) => {
  const namespace = socket.nsp;
  const eventId = socket.nsp.name.split('/')[2];

  console.log(`🔌 WS: Connection to event ${eventId}`);

  socket.on('joinRoom', (rooms, callback) => {
    if (!Array.isArray(rooms)) rooms = [rooms];
    console.log(`🏠 WS: Joining rooms ${rooms.toString()}`);
    socket.join(rooms);
    callback({ ok: true });
  });

  socket.on('startJudgingSession', (...args) => handleStartSession(namespace, ...args));

  socket.on('abortJudgingSession', (...args) => handleAbortSession(namespace, ...args));

  socket.on('updateRubric', (...args) => handleUpdateRubric(namespace, ...args));

  socket.on('registerTeam', (...args) => handleRegisterTeam(namespace, ...args));

  socket.on('createTicket', (...args) => handleCreateTicket(namespace, ...args));

  socket.on('updateTicket', (...args) => handleUpdateTicket(namespace, ...args));

  socket.on('disconnect', () => {
    console.log(`❌ WS: Disconnection from event ${eventId}`);
  });
};

export default websocket;

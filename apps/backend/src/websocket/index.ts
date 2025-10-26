import { Socket } from 'socket.io';
import {
  WSServerEmittedEvents,
  WSClientEmittedEvents,
  WSInterServerEvents,
  WSSocketData
} from '@lems/types';

const websocket = (
  socket: Socket<WSClientEmittedEvents, WSServerEmittedEvents, WSInterServerEvents, WSSocketData>
) => {
  const namespace = socket.nsp;
  const divisionId = socket.nsp.name.split('/')[2];

  console.log(`🔌 WS: Connection to division ${divisionId}`);

  socket.on('joinRoom', (rooms, callback) => {
    if (!Array.isArray(rooms)) rooms = [rooms];
    console.log(`🏠 WS: Joining rooms ${rooms.toString()}`);
    socket.join(rooms);
    callback({ ok: true });
  });

  socket.on('pingRooms', callback => {
    const relevantRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
    callback({ ok: true, rooms: relevantRooms });
  });

  socket.on('disconnect', () => {
    console.log(`❌ WS: Disconnection from division ${divisionId}`);
  });
};

export default websocket;

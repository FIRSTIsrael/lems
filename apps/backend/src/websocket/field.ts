import { Socket } from 'socket.io';

const fieldSocket = (socket: Socket) => {
  console.log('WS: Field connection');

  socket.on('disconnect', () => {
    console.log('WS: Field disconnection');
  });
};

export default fieldSocket;

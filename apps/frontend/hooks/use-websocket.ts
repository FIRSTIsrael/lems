import { useState, useEffect } from 'react';
import { WSEventListener, ConnectionStatus, WSRoomName } from '@lems/types';
import { getSocket } from '../lib/utils/websocket';

export const useWebsocket = (
  eventId: string,
  rooms: Array<WSRoomName>,
  init?: (...args: any[]) => void | Promise<void>,
  wsevents?: Array<WSEventListener>
) => {
  const socket = getSocket(eventId);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    socket.connected ? 'connected' : 'disconnected'
  );

  useEffect(() => {
    socket.connect();
    if (!socket.connected) setConnectionStatus('connecting');

    if (init) init();

    const onConnect = () => {
      setConnectionStatus('connected');

      for (const room of rooms) {
        socket.emit('joinRoom', room, response => {
          // { ok: true }
        });
      }
    };

    const onDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // TODO: Fix typing so that we don't need to ignore typescript
    if (wsevents) {
      for (const event of wsevents) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        socket.on(event.name, event.handler);
      }
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);

      if (wsevents) {
        for (const event of wsevents) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          socket.on(event.name, event.handler);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { socket, connectionStatus };
};

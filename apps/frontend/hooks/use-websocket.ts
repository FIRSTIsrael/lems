import { useState, useEffect } from 'react';
import { WSEventListener, ConnectionStatus, WSRoomName } from '@lems/types';
import { getSocket } from '../lib/utils/websocket';

export const useWebsocket = (
  divisionId: string,
  rooms: Array<WSRoomName>,
  init?: (...args: any[]) => void | Promise<void>,
  wsevents?: Array<WSEventListener>
) => {
  const socket = getSocket(divisionId);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    socket.connected ? 'connected' : 'disconnected'
  );

  useEffect(() => {
    socket.connect();
    if (!socket.connected) setConnectionStatus('connecting');

    if (init) init();

    const onConnect = () => {
      setConnectionStatus('connected');

      socket.emit('joinRoom', rooms, response => {
        // { ok: true }
      });
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

  useEffect(() => {
    const refreshConnection = () => {
      setConnectionStatus('connecting');
      socket.disconnect();
      socket.connect();
      socket.emit('joinRoom', rooms, () => {
        setConnectionStatus('connected');
      });
    };

    const compareArrays = (arr1: string[], arr2: string[]) => {
      if (arr1.length !== arr2.length) return false;
      return arr1.every(item => arr2.includes(item));
    };

    const intervalId = setInterval(() => {
      let gotResponse = false;

      socket
        .timeout(500)
        .emit('pingRooms', (err: Error, res?: { rooms: string[]; ok: boolean; error?: string }) => {
          gotResponse = true;
          if (err || !res || !compareArrays(res.rooms, rooms)) {
            refreshConnection();
          }
        });

      setTimeout(() => {
        if (!gotResponse) refreshConnection();
      }, 800);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [socket, rooms]);

  return { socket, connectionStatus };
};

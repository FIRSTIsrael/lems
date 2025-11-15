import { useState, useEffect, useCallback, useRef } from 'react';
import { WSEventListener, ConnectionStatus, WSRoomName } from '@lems/types';
import { getSocket } from '../lib/utils/websocket';

const MAX_RETRIES = 5;
const TIMEOUT = 800;
const BASE_DELAY = 1000;
const MAX_DELAY = 30000;

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
  const retryRef = useRef(0);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const compareArrays = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every(item => arr2.includes(item));
  };

  const calculateDelay = useCallback(() => {
    const delay = Math.min(BASE_DELAY * Math.pow(2, retryRef.current), MAX_DELAY);
    return delay;
  }, []);

  const reconnect = useCallback(() => {
    if (retryRef.current >= MAX_RETRIES) {
      console.error('Max reconnection attempts reached');
      setConnectionStatus('error');
      return;
    }

    socket.disconnect();
    retryRef.current += 1;
    const delay = calculateDelay();

    setTimeout(() => {
      setConnectionStatus(prev => (prev === 'error' ? 'error' : 'connecting'));

      socket.connect();
      socket.emit('joinRoom', rooms, response => {
        if (!response.ok) {
          setConnectionStatus('error');
          reconnect();
        } else {
          retryRef.current = 0;
          setConnectionStatus('connected');
        }
      });
    }, delay);
  }, [socket, calculateDelay, rooms]);

  const heartbeat = useCallback(() => {
    if (!socket.connected) return;

    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    socket
      .timeout(TIMEOUT)
      .emit('pingRooms', (error: Error | null, response: { ok: boolean; rooms: string[] }) => {
        if (error) {
          console.error('Heartbeat failed:', error);
          reconnect();
          return;
        }

        if (!response.ok || !compareArrays(response.rooms, rooms)) {
          console.warn('Room mismatch or invalid response:', response);
          reconnect();
          return;
        }

        const delay = calculateDelay();
        heartbeatTimeoutRef.current = setTimeout(heartbeat, delay);
      });
  }, [socket, rooms, reconnect, calculateDelay]);

  useEffect(() => {
    return () => {
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    socket.connect();
    if (!socket.connected) setConnectionStatus('connecting');

    if (init) init();

    const onConnect = () => {
      setConnectionStatus('connected');

      socket.emit('joinRoom', rooms, response => {
        if (!response.ok) {
          setConnectionStatus('disconnected');
          reconnect();
        }
        heartbeat();
      });
    };

    const onDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    socket.on('connect_error', (error: any) => {
      console.error('Connection error:', error);
      setConnectionStatus('error');
      reconnect();
    });

    if (wsevents) {
      for (const event of wsevents) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        socket.on(event.name, event.handler);
      }
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error');
      socket.off('disconnect', onDisconnect);

      if (wsevents) {
        for (const event of wsevents) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          socket.off(event.name, event.handler);
        }
      }

      socket.disconnect();
      retryRef.current = 0;
      setConnectionStatus('disconnected');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return { socket, connectionStatus };
};
